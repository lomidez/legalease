#!/bin/bash

read -r -s -p "Sudo password: " PASS

echo
(
  export ANSIBLE_BECOME_PASS="$PASS"

  # Terraform and Google Cloud CLI
  # Only needed to deploy the VM -- the VM itself doesn't need these 
  wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | \
    sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/hashicorp.list
  
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

  # Ansible deploys the meat of the app
  sudo add-apt-repository -y --update ppa:ansible/ansible

  sudo apt-get update
  sudo apt install -y software-properties-common gnupg google-cloud-cli ansible terraform python3-debian

  ansible-playbook playbooks/init.yml -e "target_host=localhost"
  ansible-playbook playbooks/services.yml -e "target_host=localhost"
  ansible-playbook playbooks/runner.yml -e "target_host=localhost"
)
