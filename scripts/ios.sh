#!/bin/bash
LIP=$(ipconfig getifaddr en0)

echo "🍦 Starting local development to ios device - ensure local dev server is running already"
echo "🏗️ Type checking and building for development..."
npm run build:ios
echo "🔃 Capacitor installation, podfile installation, sync and copy to app distribution folders..."
npx cap sync ios
echo "🏃 Select an iOS device to run the build at local ip address ${LIP} on..."
# eval "npx cap run ios --live-reload --host=${LIP} --port=3000 --target=B5A00B76-1049-432C-B953-288E783CDD92"
# eval "npx cap run ios --target=B5A00B76-1049-432C-B953-288E783CDD92"
eval "npx cap run ios"