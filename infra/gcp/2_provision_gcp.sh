#!/bin/bash

# Generate SSH key

SSH_KEY=$(op read "op://Personal/LegalEase GCP Key/private key")

echo "$SSH_KEY" > ~/.ssh/legalease_gcp_key
chmod 600 ~/.ssh/legalease_gcp_key

# Begin Provisioning

# List of zones to try
zones=(
    "us-central1-a"
    "us-central1-b"
    "us-central1-c"
    "us-central1-f"
)

# List of machine types to try
machines=(
    "n1-standard-1"
    "n1-standard-2"
    "n1-standard-4"
)

update_tfvars() {
  local zone=$1
  local machine=$2
  cat > terraform.tfvars << EOF
    zones = ["$zone"]
    machine_type = "$machine"
EOF
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

    for machine in "${machines[@]}"; do
      for zone in "${zones[@]}"; do
          # Update tfvars with zone and machine
          update_tfvars "$zone" "$machine"
          echo "Attempting to deploy $machine in zone $zone"
          sleep 2
          
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
                  echo "Failed to deploy $machine in $zone due to resource unavailability. Trying next zone..."
                  sleep 2
              else
                  echo "Failed to deploy $machine in $zone due to unexpected error:"
                  cat "$error_log"
                  exit 1
              fi
          fi
      done
    done

    # Clean up error log
    rm -f "$error_log"

    if [ "$success" = false ]; then
        echo "Failed to deploy in any zone. Resource is unavailable. Cleaning up..."
        sleep 2
        terraform destroy -auto-approve
        echo "Clean up completed. Please try again."
        exit 1
    fi
}

provision
