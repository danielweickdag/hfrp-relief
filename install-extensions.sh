#!/bin/bash

# Function to install VSIX extension
install_vsix() {
    if [ -f "$1" ]; then
        echo "Installing extension: $1"
        "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension "$1"
        echo "Extension installed successfully!"
    else
        echo "VSIX file not found: $1"
    fi
}

# Auto-find and install all VSIX files
echo "Searching for VSIX files..."
find . -name "*.vsix" -type f | while read vsix_file; do
    echo "Found VSIX file: $vsix_file"
    install_vsix "$vsix_file"
done

# Check Downloads folder too
if [ -d ~/Downloads ]; then
    find ~/Downloads -name "*.vsix" -type f 2>/dev/null | while read vsix_file; do
        echo "Found VSIX file in Downloads: $vsix_file"
        install_vsix "$vsix_file"
    done
fi

echo "VSIX installation process complete!"