<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col"
  >
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 2 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center px-8 py-8">
      <!-- Icon -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6"
        >
          <Icon name="ri:notification-2-line" size="48" class="text-white" />
        </div>

        <h1 class="text-3xl font-bold mb-3">Stay Connected</h1>
        <p class="text-gray-600 text-lg mb-8">
          Get notified when friends post, comment, or message you
        </p>
      </div>

      <!-- Features List -->
      <div class="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Icon name="ri:heart-line" size="20" class="text-purple-600" />
            </div>
            <div>
              <p class="font-medium">Likes & Comments</p>
              <p class="text-sm text-gray-500">
                Know when someone interacts with your posts
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Icon
                name="ri:message-3-line"
                size="20"
                class="text-purple-600"
              />
            </div>
            <div>
              <p class="font-medium">Direct Messages</p>
              <p class="text-sm text-gray-500">Get alerted for new messages</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Icon name="ri:user-add-line" size="20" class="text-purple-600" />
            </div>
            <div>
              <p class="font-medium">New Followers</p>
              <p class="text-sm text-gray-500">Know when someone follows you</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Illustration -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <div
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xs font-bold">3</span>
          </div>
          <Icon name="ri:smartphone-line" size="64" class="text-gray-400" />
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <button
          @click="handleEnableNotifications"
          :disabled="isRegistering"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Icon
            v-if="isRegistering"
            name="ri:loader-4-line"
            size="20"
            class="animate-spin"
          />
          <span>{{
            isRegistering ? "Enabling..." : "Enable Notifications"
          }}</span>
        </button>
        <NuxtLink
          to="/onboarding/camera"
          class="block w-full text-center text-gray-500 font-medium text-sm"
        >
          Not now
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PushNotifications } from "@capacitor/push-notifications";
import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";

definePageMeta({
  layout: false,
  auth: false,
});

const router = useRouter();
const isRegistering = ref(false);
const errorMessage = ref("");
const config = useRuntimeConfig();

// Check if we're on a mobile device
const isMobile = computed(() => config.public.isMobile);

// Get or create a unique device/browser identifier
const getDeviceIdentifier = async (): Promise<string> => {
  if (isMobile.value) {
    // For native mobile, use Capacitor Device ID
    try {
      const info = await Device.getId();
      return info.identifier;
    } catch (error) {
      console.error("Failed to get device ID:", error);
      // Fallback to stored UUID
      let id = localStorage.getItem("device_id");
      if (!id) {
        id = uuidv4();
        localStorage.setItem("device_id", id);
      }
      return id;
    }
  } else {
    // For web, use or create a browser ID
    let id = localStorage.getItem("browser_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("browser_id", id);
    }
    return id;
  }
};

// Handle native mobile push notifications
const registerMobileNotifications = async () => {
  try {
    // Check permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      throw new Error("Permission denied for notifications");
    }

    // Register for push notifications
    await PushNotifications.register();

    // Return a promise that resolves when we get the token
    return new Promise<string>((resolve, reject) => {
      // Add listener for registration token
      PushNotifications.addListener("registration", (token) => {
        console.info("Push registration token:", token.value);
        resolve(token.value);
      });

      // Add listener for registration errors
      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration error:", err.error);
        reject(new Error(err.error));
      });

      // Add listener for received notifications
      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          console.log("Push notification received:", notification);
        }
      );

      // Add listener for notification actions
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          console.log(
            "Push notification action performed",
            notification.actionId,
            notification.inputValue
          );
        }
      );
    });
  } catch (error) {
    console.error("Mobile notification registration failed:", error);
    throw error;
  }
};

// Handle browser web push notifications
const registerBrowserNotifications = async (): Promise<string> => {
  try {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Permission denied for notifications");
    }

    // For web push, we would typically register a service worker and get a push subscription
    // For now, we'll use a simple browser token (the browser ID)
    const browserId = await getDeviceIdentifier();
    return browserId;
  } catch (error) {
    console.error("Browser notification registration failed:", error);
    throw error;
  }
};

// Register the notification token with the backend
const registerWithBackend = async (token: string, identifier: string) => {
  const platform = isMobile.value ? (await Device.getInfo()).platform : "web";

  const { data, error: fetchError } = await useDynamicFetch(
    "/api/notify/register",
    {
      method: "POST",
      body: {
        type: "push",
        token: token,
        identifier: identifier,
        platform: platform,
        expires_at: null,
      },
    }
  );

  if (fetchError.value) {
    console.error("Failed to register notification token:", fetchError.value);
    throw new Error("Failed to register notification token with backend");
  }
};

// Main handler for enabling notifications
const handleEnableNotifications = async () => {
  if (isRegistering.value) return;

  isRegistering.value = true;
  errorMessage.value = "";

  try {
    const identifier = await getDeviceIdentifier();
    let token: string;

    if (isMobile.value) {
      // Use Capacitor Push Notifications for mobile
      token = await registerMobileNotifications();
    } else {
      // Use browser notifications for web
      token = await registerBrowserNotifications();
    }

    // Register with backend
    await registerWithBackend(token, identifier);

    // Success! Navigate to next step
    await router.push("/onboarding/camera");
  } catch (error: any) {
    console.error("Failed to enable notifications:", error);
    errorMessage.value =
      error.message || "Failed to enable notifications. Please try again.";
  } finally {
    isRegistering.value = false;
  }
};
</script>
