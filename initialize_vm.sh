#!/bin/bash

# add terraform repo
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | \
  sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list

# install packages
sudo add-apt-repository -y --update ppa:ansible/ansible
sudo apt-get update
sudo apt install -y software-properties-common gnupg ansible terraform python3-debian

# run playbooks
ansible-playbook playbooks/init.yml -e "target_host=localhost"

# enable pip3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11
