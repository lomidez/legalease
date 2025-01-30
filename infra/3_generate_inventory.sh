#!/bin/bash

IP=$(cd terraform && terraform output -raw instance_ip)

ssh-keygen -R "$IP"

cat > ansible/inventory.ini << EOF
[gcp_instance]
legalease ansible_host=${IP} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/legalease_gcp_key
EOF
