#!/bin/bash

# Update npm
npm install -g npm

# SSM CLI Manager
npm i -g @sudolabs-io/aws-ssm-cli
npm install -g apidog-cli

# Install Node dependencies
npm install

# configure git aliases
git config --global alias.s status
git config --global alias.co checkout

# generate ssh key
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa

echo "Add the following public key to your GitHub account: \n"
cat ~/.ssh/id_rsa.pub

echo "postCreateCommand Finished\!"
