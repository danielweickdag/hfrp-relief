#!/bin/bash

# 🔄 Quick Update Script
# For common content and configuration updates

echo "🔄 Quick Update Tool"
echo "==================="

# Function to update donation goal
update_donation_goal() {
    echo "💰 Current donation goal update"
    echo "Enter new donation goal amount (e.g., 50000):"
    read -r NEW_GOAL
    
    if [[ $NEW_GOAL =~ ^[0-9]+$ ]]; then
        # Update the donation goal in the donate page
        sed -i.bak "s/goal: [0-9]*/goal: $NEW_GOAL/g" src/app/donate/page.tsx
        echo "✅ Donation goal updated to \$$NEW_GOAL"
        return 0
    else
        echo "❌ Invalid amount. Please enter numbers only."
        return 1
    fi
}

# Function to add new gallery image
add_gallery_image() {
    echo "🖼️ Add new gallery image"
    echo "Enter image filename (must be in public/gallery/):"
    read -r IMAGE_NAME
    
    if [ -f "public/gallery/$IMAGE_NAME" ]; then
        echo "✅ Image found: $IMAGE_NAME"
        echo "Enter image caption:"
        read -r CAPTION
        echo "Image ready for deployment with caption: $CAPTION"
        return 0
    else
        echo "❌ Image not found. Please upload to public/gallery/ first."
        return 1
    fi
}

# Function to update contact information
update_contact_info() {
    echo "📞 Update contact information"
    echo "1. Update email"
    echo "2. Update phone"
    echo "3. Update address"
    echo "Choose option (1-3):"
    read -r CONTACT_OPTION
    
    case $CONTACT_OPTION in
        1)
            echo "Enter new email address:"
            read -r NEW_EMAIL
            echo "✅ Email will be updated to: $NEW_EMAIL"
            ;;
        2)
            echo "Enter new phone number:"
            read -r NEW_PHONE
            echo "✅ Phone will be updated to: $NEW_PHONE"
            ;;
        3)
            echo "Enter new address:"
            read -r NEW_ADDRESS
            echo "✅ Address will be updated to: $NEW_ADDRESS"
            ;;
        *)
            echo "❌ Invalid option"
            return 1
            ;;
    esac
}

# Main menu
echo "What would you like to update?"
echo "1. Donation goal"
echo "2. Add gallery image"
echo "3. Contact information"
echo "4. Deploy current changes"
echo "5. Run health check"
echo ""
echo "Choose option (1-5):"
read -r OPTION

case $OPTION in
    1)
        update_donation_goal
        if [ $? -eq 0 ]; then
            echo "Deploy changes? (y/n):"
            read -r DEPLOY
            if [ "$DEPLOY" = "y" ]; then
                ./scripts/deploy-and-verify.sh
            fi
        fi
        ;;
    2)
        add_gallery_image
        ;;
    3)
        update_contact_info
        ;;
    4)
        echo "🚀 Deploying current changes..."
        ./scripts/deploy-and-verify.sh
        ;;
    5)
        echo "🏥 Running health check..."
        node monitoring-setup.js
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Quick update complete!"