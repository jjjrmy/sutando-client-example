<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col"
  >
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 3 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center px-8 py-8">
      <!-- Icon -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6"
        >
          <Icon name="ri:camera-line" size="48" class="text-white" />
        </div>

        <h1 class="text-3xl font-bold mb-3">Share Your Moments</h1>
        <p class="text-gray-600 text-lg mb-8">
          Allow access to camera and photos to create and share posts
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-4 text-center">
          <div
            class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Icon name="ri:camera-line" size="24" class="text-blue-600" />
          </div>
          <h3 class="font-semibold mb-1">Camera</h3>
          <p class="text-xs text-gray-500">Take photos & videos</p>
        </div>

        <div class="bg-white rounded-2xl p-4 text-center">
          <div
            class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Icon name="ri:image-line" size="24" class="text-purple-600" />
          </div>
          <h3 class="font-semibold mb-1">Photos</h3>
          <p class="text-xs text-gray-500">Share from gallery</p>
        </div>
      </div>

      <!-- Permission Benefits -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <h3 class="font-medium mb-3">Why we need access:</h3>
        <ul class="space-y-2">
          <li class="flex items-start space-x-2">
            <Icon
              name="ri:check-line"
              size="20"
              class="text-green-500 mt-0.5 flex-shrink-0"
            />
            <span class="text-sm text-gray-600"
              >Create posts with photos and videos</span
            >
          </li>
          <li class="flex items-start space-x-2">
            <Icon
              name="ri:check-line"
              size="20"
              class="text-green-500 mt-0.5 flex-shrink-0"
            />
            <span class="text-sm text-gray-600"
              >Add photos to your stories</span
            >
          </li>
          <li class="flex items-start space-x-2">
            <Icon
              name="ri:check-line"
              size="20"
              class="text-green-500 mt-0.5 flex-shrink-0"
            />
            <span class="text-sm text-gray-600"
              >Update your profile picture</span
            >
          </li>
        </ul>
      </div>

      <!-- Privacy Note -->
      <div class="bg-blue-50 rounded-xl p-4 mb-8">
        <div class="flex items-start space-x-3">
          <Icon
            name="ri:lock-line"
            size="20"
            class="text-blue-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <p class="text-sm font-medium text-blue-900">
              Your privacy matters
            </p>
            <p class="text-xs text-blue-700 mt-1">
              You can change these permissions anytime in your device settings
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
      >
        <div class="flex items-center space-x-2">
          <Icon name="ri:check-line" size="20" class="text-green-600" />
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <button
          @click="handleAllowAccess"
          :disabled="isRequesting"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Icon
            v-if="isRequesting"
            name="ri:loader-4-line"
            size="20"
            class="animate-spin"
          />
          <span>{{ isRequesting ? "Requesting..." : "Allow Access" }}</span>
        </button>
        <button
          @click="skipAndComplete"
          :disabled="isCompleting"
          class="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isCompleting ? "Finishing..." : "Skip & Finish Setup" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera } from "@capacitor/camera";

const { user } = useAuth();

definePageMeta({
  layout: false,
  auth: false,
});

const router = useRouter();
const config = useRuntimeConfig();
const isRequesting = ref(false);
const isCompleting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Check if we're on a mobile device
const isMobile = computed(() => config.public.isMobile);

// Request camera permissions for mobile
const requestMobileCameraPermissions = async () => {
  try {
    // Check current permissions
    const permissions = await Camera.checkPermissions();

    console.log("Current camera permissions:", permissions);

    // If permissions aren't granted, request them
    if (permissions.camera !== "granted" || permissions.photos !== "granted") {
      const result = await Camera.requestPermissions({
        permissions: ["camera", "photos"],
      });

      console.log("Permission request result:", result);

      if (result.camera !== "granted" && result.photos !== "granted") {
        throw new Error("Camera and photo permissions were denied");
      }

      // Show success message based on what was granted
      if (result.camera === "granted" && result.photos === "granted") {
        successMessage.value = "Camera and photo access granted!";
      } else if (result.camera === "granted") {
        successMessage.value = "Camera access granted!";
      } else if (result.photos === "granted") {
        successMessage.value = "Photo access granted!";
      }
    } else {
      successMessage.value = "Camera and photo access already granted!";
    }

    return true;
  } catch (error: any) {
    console.error("Mobile camera permission request failed:", error);
    throw error;
  }
};

// Request camera/file permissions for browser
const requestBrowserCameraPermissions = async () => {
  try {
    // For web browsers, we can't pre-request camera permissions
    // They're requested when getUserMedia is called
    // We'll just check if the API is available

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API is not supported in this browser");
    }

    // Try to access the camera briefly to trigger permission prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      // Stop the stream immediately - we just wanted to request permission
      stream.getTracks().forEach((track) => track.stop());

      successMessage.value = "Camera access granted!";
      return true;
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        throw new Error("Camera permission was denied");
      } else if (err.name === "NotFoundError") {
        throw new Error("No camera found on this device");
      } else {
        throw new Error("Failed to access camera");
      }
    }
  } catch (error) {
    console.error("Browser camera permission request failed:", error);
    throw error;
  }
};

// Complete onboarding
const completeOnboarding = async () => {
  if (!(user.value as any)?.id) return;

  isCompleting.value = true;

  try {
    const { data, error: fetchError } = await useDynamicFetch(`/api/user`, {
      method: "PUT",
      body: {
        onboarded: true,
      },
    });

    if (fetchError.value) {
      console.error("Failed to complete onboarding:", fetchError.value);
      throw new Error("Failed to complete onboarding");
    }

    // Navigate to home
    await router.push("/");
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    errorMessage.value = "Failed to complete onboarding. Please try again.";
  } finally {
    isCompleting.value = false;
  }
};

// Handle allow access button
const handleAllowAccess = async () => {
  if (isRequesting.value) return;

  isRequesting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (isMobile.value) {
      // Use Capacitor Camera for mobile
      await requestMobileCameraPermissions();
    } else {
      // Use browser camera API for web
      await requestBrowserCameraPermissions();
    }

    // Wait a bit to show the success message
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Complete onboarding and navigate
    await completeOnboarding();
  } catch (error: any) {
    console.error("Failed to request camera permissions:", error);
    errorMessage.value =
      error.message || "Failed to request camera access. Please try again.";
  } finally {
    isRequesting.value = false;
  }
};

// Handle skip button
const skipAndComplete = async () => {
  if (isCompleting.value) return;
  await completeOnboarding();
};
</script>
