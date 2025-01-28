#!/bin/bash

# List of zones to try
zones=(
    "us-central1-a"
    "us-central1-b"
    "us-central1-c"
    "us-central1-f"
)

update_tfvars() {
    local zone=$1
    echo "zones = [\"$zone\"]" > terraform.tfvars
}

# List of error logs that leads to a retry
is_gpu_error() {
    local error_log=$1
    grep -q "does not have enough resources available to fulfill the request" "$error_log" || \
    grep -q "Try a different zone, or try again later" "$error_log" || \
    grep -q "VM instance with.*accelerator.*is currently unavailable" "$error_log" || \
    grep -q "ZONE_RESOURCE_POOL_EXHAUSTED" "$error_log" || \
    grep -q "QUOTA_EXCEEDED" "$error_log"
}

provision() {
    cd terraform || exit 1
    local error_log="terraform_error.log"
    local success=false

    for zone in "${zones[@]}"; do
        echo "Attempting deployment in zone: $zone"
        
        # Update tfvars with current zone
        update_tfvars "$zone"
        
        # Initialize Terraform if needed
        if [ ! -d ".terraform" ]; then
            terraform init
        fi

        # Attempt to provision
        if terraform apply -auto-approve 2> "$error_log"; then
            echo "Success! Deployment completed in zone: $zone"
            success=true
            break
        else
            if is_gpu_error "$error_log"; then
                echo "Failed to deploy in $zone due to GPU unavailability. Trying next zone..."
                sleep 5  # Cleanup partially created resources before retry
                terraform destroy -auto-approve >/dev/null 2>&1
            else
                echo "Failed to deploy in $zone due to unexpected error:"
                cat "$error_log"
                exit 1
            fi
        fi
    done

    # Clean up error log
    rm -f "$error_log"

    if [ "$success" = false ]; then
        echo "Failed to deploy in any zone. No GPUs available."
        exit 1
    fi

    # Display the IP address
    echo "Deployment completed. Instance details:"
    terraform output
}

provision
