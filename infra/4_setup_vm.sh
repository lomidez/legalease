#!/bin/bash

# in GCP, sudo is passwordless
ansible-playbook -i ansible/inventory.ini ansible/playbooks/init.yml
