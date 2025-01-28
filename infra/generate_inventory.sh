#!/bin/bash

IP=$(terraform output -raw instance_ip)
SSH_KEY=$(op read "op://Personal/LegalEase GCP Ansible/private key")

echo "$SSH_KEY" > ~/.ssh/terraform_key
chmod 600 ~/.ssh/terraform_key

cat > ansible/inventory.ini << EOF
[gcp_instance]
legalease ansible_host=${IP} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/terraform_key
EOF
