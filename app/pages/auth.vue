<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  auth: false,
});

const phoneNumber = ref("+14079538970"); // TODO: should be null
const otpCode = ref("");
const isOtpSent = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref(false);

const { client: authClient } = useAuth();

const signInWithApple = async () => {
  const { data, error: authError } = await authClient.signIn.social({
    provider: "apple",
  });
  if (authError) throw authError;
  console.log(data);
};

const signInWithGithub = async () => {
  const { data, error: authError } = await authClient.signIn.social({
    provider: "github",
  });
  if (authError) throw authError;
  console.log(data);
};

const handlePhoneSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: authError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneNumber.value,
    });
    if (authError) throw authError;
    isOtpSent.value = true;
  } catch (err) {
    error.value =
      "Failed to send verification code. Please check your sphone number and try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleOtpSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: authError } = await authClient.phoneNumber.verify({
      phoneNumber: phoneNumber.value,
      code: otpCode.value,
    });

    if (authError) throw authError;

    success.value = true;
    // After successful verification, we'll handle auth state later
    navigateTo("/dashboard");
  } catch (err) {
    error.value = "Verification failed. Please try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Header component omitted (not available in this project) -->
    <div
      class="max-w-md mx-auto my-10 p-5 border border-gray-200 rounded-lg shadow-sm"
    >
      <template v-if="success">
        <h1 class="text-2xl font-bold mb-5">Authentication Successful</h1>
        <p>Redirecting to dashboard...</p>
      </template>

      <template v-else>
        <h1 class="text-2xl font-bold mb-5">Phone Authentication</h1>

        <form v-if="!isOtpSent" @submit.prevent="handlePhoneSubmit">
          <div class="mb-5">
            <label for="phoneNumber" class="block mb-2 font-semibold">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              v-model="phoneNumber"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">
              Enter your phone number with country code (e.g. +1 for US)
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ loading ? "Sending..." : "Send Verification Code" }}
          </button>
        </form>

        <form v-else @submit.prevent="handleOtpSubmit()">
          <div class="mb-5">
            <label for="otpCode" class="block mb-2 font-semibold">
              Verification Code
            </label>
            <input
              id="otpCode"
              type="text"
              placeholder="Enter 6-digit code"
              v-model="otpCode"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ loading ? "Verifying..." : "Verify Code" }}
          </button>

          <button
            type="button"
            @click="isOtpSent = false"
            class="w-full p-2.5 bg-transparent text-blue-600 rounded-md hover:bg-gray-50 mt-2.5"
          >
            Back to Phone Entry
          </button>
        </form>

        <div class="mt-5 flex flex-col gap-3">
          <button
            @click="signInWithGithub"
            class="w-full p-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:ring-2 focus:ring-gray-300 flex items-center justify-center gap-2"
          >
            Sign in with Github
          </button>
          <button
            @click="signInWithApple"
            class="w-full p-2.5 bg-black text-white rounded-md hover:bg-gray-900 focus:ring-2 focus:ring-gray-300 flex items-center justify-center gap-2"
          >
            Sign in with Apple
          </button>
        </div>

        <div v-if="error" class="mt-5 p-2.5 bg-red-50 text-red-700 rounded-md">
          {{ error }}
        </div>

        <div class="mt-7 text-center border-t border-gray-100 pt-5">
          <p class="text-xs text-gray-500">
            Powered by
            <a
              href="https://better-auth.com"
              target="_blank"
              class="text-blue-600 underline ml-1 hover:text-blue-800"
            >
              better-auth
            </a>
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
