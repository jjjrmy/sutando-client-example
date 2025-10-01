<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col"
  >
    <!-- Logo/Header -->
    <div class="flex-1 flex flex-col justify-center px-8 pt-8">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-3xl backdrop-blur-sm mb-4"
        >
          <Icon name="ri:lock-unlock-line" size="56" class="text-white" />
        </div>
        <h1 class="text-4xl font-bold text-white mb-2">Welcome</h1>
        <p class="text-white text-opacity-90">Sign in to continue</p>
      </div>
    </div>

    <!-- Auth Form -->
    <div class="bg-white rounded-t-3xl px-8 pt-8 pb-12">
      <!-- Phone Number Input -->
      <div v-if="!showOTP" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Phone Number</label
          >
          <div class="flex gap-2">
            <select v-model="countryCode" class="input-base w-20">
              <option value="+1">🇺🇸 +1</option>
            </select>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              v-model="phoneNumberInput"
              @input="formatPhoneNumber"
              class="input-base flex-1"
              :disabled="loading"
            />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            We'll send a verification code
          </p>
        </div>
        <button
          @click="handlePhoneSubmit"
          :disabled="loading || !phoneNumberInput"
          class="btn-primary w-full"
        >
          {{ loading ? "Sending..." : "Continue" }}
        </button>
      </div>

      <!-- OTP Input -->
      <div v-else class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-medium text-gray-700">Enter code</label>
            <button
              @click="showOTP = false"
              class="text-purple-600 text-sm font-medium"
            >
              Change
            </button>
          </div>
          <div class="flex justify-between gap-2 mb-2">
            <input
              v-for="i in 6"
              :key="i"
              type="text"
              maxlength="1"
              class="otp-input"
              :data-otp-index="i - 1"
              :value="otpValues[i - 1]"
              @input="moveToNext($event, i)"
              @keydown.backspace="moveToPrevious($event, i)"
              @paste="i === 1 ? handleOtpPaste($event) : null"
              :disabled="loading"
            />
          </div>
          <p class="text-xs text-gray-500">
            Sent to {{ formattedPhoneNumber }}
          </p>
        </div>
        <button
          @click="handleOtpSubmit"
          :disabled="loading || otpValues.some((v: string) => !v)"
          class="btn-primary w-full"
        >
          {{ loading ? "Verifying..." : "Verify" }}
        </button>
        <button
          @click="resendCode"
          :disabled="loading"
          class="w-full text-purple-600 font-medium text-sm"
        >
          Resend code
        </button>
      </div>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Social Login Buttons -->
      <div class="space-y-3">
        <button
          @click="signInWithApple"
          :disabled="loading"
          class="btn-social bg-black hover:bg-gray-900 text-white"
        >
          <Icon name="ri:apple-fill" size="20" />
          <span>Continue with Apple</span>
        </button>
        <button
          @click="signInWithGoogle"
          :disabled="loading"
          class="btn-social bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
        >
          <Icon name="ri:google-fill" size="20" />
          <span>Continue with Google</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
      <div v-if="success" class="alert alert-success">
        Authentication successful! Redirecting...
      </div>

      <!-- Terms -->
      <p class="text-center text-gray-500 text-xs mt-8">
        By continuing, you agree to our
        <a href="#" class="text-purple-600">Terms</a> and
        <a href="#" class="text-purple-600">Privacy</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from "@capacitor/core";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";

definePageMeta({
  layout: false,
  auth: { only: "guest" },
});

const config = useRuntimeConfig();

const showOTP = ref(false);
const countryCode = ref("+1");
const phoneNumberInput = ref("");
const otpValues = ref<string[]>(["", "", "", "", "", ""]);
const loading = ref(false);
const error = ref("");
const success = ref(false);

const { client: authClient } = useAuth();

const isNative = Capacitor.isNativePlatform();

// Phone number helpers
const fullPhoneNumber = computed(
  () => `${countryCode.value}${phoneNumberInput.value.replace(/\D/g, "")}`
);

const formattedPhoneNumber = computed(() => {
  const clean = phoneNumberInput.value.replace(/\D/g, "");
  if (countryCode.value === "+1" && clean.length === 10) {
    return `${countryCode.value} (${clean.slice(0, 3)}) ${clean.slice(
      3,
      6
    )}-${clean.slice(6)}`;
  }
  return `${countryCode.value} ${phoneNumberInput.value}`;
});

const handlePhoneSubmit = async () => {
  loading.value = true;
  error.value = "";

  if (!phoneNumberInput.value) {
    error.value = "Please enter a phone number";
    loading.value = false;
    return;
  }

  try {
    const { error: authError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: fullPhoneNumber.value,
    });
    if (authError) throw authError;

    showOTP.value = true;
    await nextTick();
    document.querySelector<HTMLInputElement>('[data-otp-index="0"]')?.focus();
  } catch (err: any) {
    error.value = err?.message || "Failed to send code. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleOtpSubmit = async () => {
  loading.value = true;
  error.value = "";

  const otpCode = otpValues.value.join("");
  if (otpCode.length !== 6) {
    error.value = "Please enter all 6 digits";
    loading.value = false;
    return;
  }

  try {
    const { error: authError } = await authClient.phoneNumber.verify({
      phoneNumber: fullPhoneNumber.value,
      code: otpCode,
    });
    if (authError) throw authError;

    success.value = true;
    await navigateTo("/");
  } catch (err: any) {
    error.value = err?.message || "Verification failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

const resendCode = () => handlePhoneSubmit();

const signInWithApple = async () => {
  loading.value = true;
  error.value = "";

  try {
    let idToken;
    if (isNative) {
      try {
        const result = await SignInWithApple.authorize({
          clientId: config.public.appIdentifier as string,
          redirectURI: `${config.public.appUrl}/api/auth/callback/apple`,
          scopes: "email name",
        });
        idToken = { token: result.response.identityToken };
      } catch {
        error.value = "Apple sign-in cancelled";
        loading.value = false;
        return;
      }
    }

    const { error: authError } = await authClient.signIn.social({
      provider: "apple",
      ...(idToken ? { idToken } : { callbackURL: "/" }),
    });
    if (authError) throw authError;

    // Redirect immediately for OAuth
    await navigateTo("/");
  } catch (err: any) {
    error.value = err?.message || "Apple sign-in failed";
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { error: authError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (authError) throw authError;

    // Redirect immediately for OAuth
    await navigateTo("/");
  } catch (err: any) {
    error.value = err?.message || "Google sign-in failed";
  } finally {
    loading.value = false;
  }
};

const moveToNext = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  otpValues.value[index - 1] = target.value;

  if (target.value && index < 6) {
    const next = document.querySelector<HTMLInputElement>(
      `[data-otp-index="${index}"]`
    );
    next?.focus();
    next?.select();
  }

  // Auto-submit when all 6 digits are entered
  if (
    index === 6 &&
    target.value &&
    otpValues.value.every((v) => v.length === 1)
  ) {
    handleOtpSubmit();
  }
};

const moveToPrevious = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.value && index > 1) {
    otpValues.value[index - 1] = "";
    const prev = document.querySelector<HTMLInputElement>(
      `[data-otp-index="${index - 2}"]`
    );
    prev?.focus();
    prev?.select();
  }
};

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const cleanedData = (event.clipboardData?.getData("text/plain") || "")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (cleanedData) {
    otpValues.value = cleanedData
      .split("")
      .concat(Array(6 - cleanedData.length).fill(""));

    const nextEmptyIndex = otpValues.value.findIndex((v) => !v);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const input = document.querySelector<HTMLInputElement>(
      `[data-otp-index="${focusIndex}"]`
    );
    input?.focus();
    input?.select();

    if (cleanedData.length === 6) handleOtpSubmit();
  }
};

const formatPhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, "");

  if (countryCode.value === "+1") {
    // Format for US/Canada numbers
    if (value.length <= 3) {
      target.value = value;
    } else if (value.length <= 6) {
      target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
      target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(
        6,
        10
      )}`;
    }
  } else {
    target.value = value.slice(0, 15);
  }

  phoneNumberInput.value = target.value;
};
</script>

<style scoped>
/* Gradient Animation */
@keyframes gradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

/* Input Styles */
.input-base {
  padding: 0.75rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.input-base:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
  border-color: rgb(147 51 234);
}

.otp-input {
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.otp-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
  border-color: rgb(147 51 234);
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(to right, rgb(147 51 234), rgb(219 39 119));
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: linear-gradient(to right, rgb(109 40 217), rgb(190 24 93));
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-social {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.btn-social:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Alert Styles */
.alert {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.alert-error {
  background-color: rgb(254 242 242);
  color: rgb(185 28 28);
}

.alert-success {
  background-color: rgb(240 253 244);
  color: rgb(22 101 52);
}
</style>
