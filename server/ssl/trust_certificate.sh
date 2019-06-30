#!/bin/bash
set -e

##################################################################################
# Trust the certificate on your local machine
#
# Usage: `./trust_certificate.sh`
#
# NOTE: certificate needs to be created first
##################################################################################

# Get this directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# Trust the cert
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$DIR/certificate.pem"
