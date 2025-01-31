#!/bin/bash

cd terraform && terraform refresh &> /dev/null && terraform output
