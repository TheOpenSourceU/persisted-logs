#!/bin/bash

DATE=$(date +"%Y%m%d")
VERSION=$(node -p "require('./package.json').version")
echo "Tagging version $VERSION"
git tag -a "v$VERSION" -m "Version $VERSION; Date: $DATE"
git tag -a "$DATE" -m "Version $VERSION; Date: $DATE"
git branch $VERSION

# -----------------------------------------------------
# Create a tag for the current version. This creates a reference
# point in the code so that it can be easily retrieved later.
# The tag is called "v$VERSION" which is the version number
# found in the package.json file.
#
# The second tag is the date of the build. This is useful for
# debugging and tracking changes to the code.
#

# -----------------------------------------------------
# Get the version number from the package.json file
# node -p is a trick to use node as a command-line evaluator
# require is used to import the package.json file and get its contents
# .version is used to access the value of the version number in the package.json file
# The result is stored in the VERSION variable

# Print the version number to the console
# echo is used to print text to the console
# The version number is included in the output string

# Create a new tag in the local repo with the version number
# git tag is used to create a new tag
# -a is used to create an annotated tag
# "v$VERSION" is used to create the tag name
# -m is used to add a message to the tag
# The message is the version number
#
# The branch is created to allow for easy maintenance of the
# version. This is important for making bug fixes to older
# versions of the software.