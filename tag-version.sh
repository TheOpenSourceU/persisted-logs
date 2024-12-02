#!/bin/bash

# Get version number from package.json
VERSION=$(node -p "require('./package.json').version")
if [ -z "$VERSION" ]; then
  echo "Error: unable to get version number from package.json"
  exit 1
fi

# Get current date
DATE=$(date +"%Y%m%d")
if [ -z "$DATE" ]; then
  echo "Error: unable to get current date"
  exit 1
fi

# Create tag with version number
if ! git tag -a "v$VERSION" -m "Version $VERSION; Date: $DATE"; then
  echo "Error: unable to create tag with version number"
  exit 1
fi

# Create branch with version number
if ! git branch $VERSION; then
  echo "Error: unable to create branch with version number"
  exit 1
fi



# -----------------------------------------------------
#
#
# This Bash script tags the current Git repository with the version number
# from the `package.json` file and the current date. It creates two tags:
# one with the version number (`v$VERSION`) and another with the date
# (`$DATE`), and also creates a new branch with the version number.
#
#
