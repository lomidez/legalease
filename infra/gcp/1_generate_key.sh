#!/bin/bash 

PUBLIC_KEY=$(op read "op://Personal/LegalEase GCP Key/public key")
PRIVATE_KEY=$(op read "op://Personal/LegalEase GCP Key/private key")

echo "$PUBLIC_KEY" > ~/.ssh/legalease_gcp_key.pub
echo "$PRIVATE_KEY" > ~/.ssh/legalease_gcp_key

chmod 644 ~/.ssh/legalease_gcp_key.pub
chmod 600 ~/.ssh/legalease_gcp_key
