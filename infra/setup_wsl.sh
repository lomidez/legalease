#!/bin/bash

ansible-playbook ansible/playbooks/init.yml -e "target_host=localhost"
