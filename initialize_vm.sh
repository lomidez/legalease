#!/bin/bash

# install packages
sudo add-apt-repository -y --update ppa:ansible/ansible
sudo apt-get update
sudo apt install -y software-properties-common gnupg google-cloud-cli ansible terraform python3-debian

# run playbooks
ansible-playbook playbooks/init.yml -e "target_host=localhost"
# ansible-playbook playbooks/services.yml -e "target_host=localhost"

# enable pip3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11
