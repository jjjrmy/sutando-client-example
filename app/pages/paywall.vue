<script setup lang="ts">
import { subscriptionPlans } from "~/products";

definePageMeta({
  auth: false,
});

const config = useRuntimeConfig();
const { client: authClient } = useAuth();
const router = useRouter();

// State for selected plan
const selectedPlan = ref(subscriptionPlans[0]?.id);
const isLoading = ref(false);

// Get the selected plan object
const currentPlan = computed(() => {
  return (
    subscriptionPlans.find((plan) => plan.id === selectedPlan.value) ||
    subscriptionPlans[0]
  );
});

// Handle subscription upgrade
const handleSubscribe = async () => {
  if (isLoading.value || !currentPlan.value) return;

  isLoading.value = true;
  try {
    const { data, error } = await authClient.subscription.upgrade({
      plan: currentPlan.value.name,
      successUrl: `${config.public.appUrl}//?success=true`,
      cancelUrl: `${config.public.appUrl}/paywall?cancel=true`,
      returnUrl: `${config.public.appUrl}//?return=true`,
      disableRedirect: false,
    });

    if (error) {
      console.error("Subscription error:", error);
      // Handle error - show toast/notification
    }
  } catch (err) {
    console.error("Failed to process subscription:", err);
    // Handle error - show toast/notification
  } finally {
    isLoading.value = false;
  }
};

// Handle close button
const handleClose = () => {
  router.push("/");
};
</script>

<template>
  <div class="fixed inset-0 bg-white flex flex-col">
    <!-- Header with close button -->
    <div class="flex justify-between items-center p-4">
      <div></div>
      <!-- Empty div for spacing -->
      <button
        @click="handleClose"
        class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <Icon name="ri:close-line" size="24" class="text-gray-600" />
      </button>
    </div>

    <!-- Scrollable main content -->
    <div class="flex-1 overflow-y-auto pb-40">
      <div class="px-6">
        <!-- Hero Gradient with Icon -->
        <div class="mb-8">
          <div
            class="w-full h-64 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-2xl flex items-center justify-center relative overflow-hidden"
          >
            <!-- Background pattern -->
            <div class="absolute inset-0 opacity-20">
              <div
                class="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"
              ></div>
            </div>

            <!-- Main Icon -->
            <div
              class="bg-white bg-opacity-30 backdrop-blur-sm rounded-full p-8"
            >
              <Icon name="ri:vip-crown-2-fill" size="64" class="text-white" />
            </div>
          </div>
        </div>

        <!-- Title and Subtitle -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Unlock Premium</h1>
          <p class="text-gray-600 text-lg leading-relaxed">
            Get unlimited access to all premium features
          </p>
        </div>

        <!-- Features List -->
        <div class="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3
            class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
          >
            <Icon name="ri:star-fill" size="20" class="text-orange-500 mr-2" />
            What's included
          </h3>
          <div class="space-y-4">
            <div
              v-for="(feature, index) in currentPlan.features"
              :key="index"
              class="flex items-start"
            >
              <div class="flex-shrink-0 mr-3">
                <div
                  class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <Icon name="ri:check-line" size="16" class="text-green-600" />
                </div>
              </div>
              <div>
                <p class="text-gray-700">{{ feature }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="space-y-4 mb-8">
          <h3 class="text-sm font-medium text-gray-700 mb-3">
            Choose your plan
          </h3>

          <div
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            @click="selectedPlan = plan.id"
            class="relative"
          >
            <button
              :class="[
                'w-full p-4 rounded-2xl text-left transition-all',
                selectedPlan === plan.id
                  ? 'bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-purple-400 shadow-lg transform scale-[1.02]'
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300',
              ]"
            >
              <!-- Popular/Discount Badge -->
              <div
                v-if="plan.isPopular || plan.discount"
                class="absolute -top-3 right-4"
              >
                <span
                  :class="[
                    'px-3 py-1 text-xs font-bold rounded-full',
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-green-500 text-white',
                  ]"
                >
                  {{ plan.isPopular ? "POPULAR" : plan.discount }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <!-- Radio button indicator -->
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors',
                      selectedPlan === plan.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-400',
                    ]"
                  >
                    <div
                      v-if="selectedPlan === plan.id"
                      class="w-2 h-2 bg-white rounded-full"
                    ></div>
                  </div>

                  <div>
                    <h3 class="font-bold text-lg text-gray-900">
                      {{ plan.displayName }}
                    </h3>
                    <p class="text-gray-600 text-sm">{{ plan.description }}</p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">
                    {{ plan.price }}
                  </p>
                  <p class="text-gray-600 text-sm">{{ plan.period }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div class="flex items-start">
            <Icon
              name="ri:information-line"
              size="20"
              class="text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Free trial available</p>
              <p class="text-blue-700">
                Try premium free for 7 days. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom CTA Section -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
    >
      <div class="px-6 py-4 pb-safe">
        <!-- Main CTA Button -->
        <button
          @click="handleSubscribe"
          :disabled="isLoading"
          :class="[
            'w-full font-semibold py-4 px-6 rounded-2xl text-lg mb-3 transition-all',
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white transform hover:scale-[1.02] active:scale-[0.98]',
          ]"
        >
          <span v-if="!isLoading" class="flex items-center justify-center">
            <Icon name="ri:lock-unlock-line" size="20" class="mr-2" />
            Start Free Trial
          </span>
          <span v-else class="flex items-center justify-center">
            <Icon name="ri:loader-4-line" size="20" class="mr-2 animate-spin" />
            Processing...
          </span>
        </button>

        <!-- Pricing Info -->
        <p class="text-center text-sm text-gray-600 mb-3">
          Then <span class="font-semibold">{{ currentPlan.price }}</span>
          {{ currentPlan.period }} after trial ends
        </p>

        <!-- Bottom Links -->
        <div class="flex justify-center items-center space-x-4 text-sm">
          <button
            class="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <Icon name="ri:refresh-line" size="16" class="inline mr-1" />
            Restore
          </button>
          <span class="text-gray-300">|</span>
          <a
            href="#"
            class="text-gray-600 hover:text-gray-700 transition-colors"
            >Terms</a
          >
          <span class="text-gray-300">|</span>
          <a
            href="#"
            class="text-gray-600 hover:text-gray-700 transition-colors"
            >Privacy</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Safe area padding for iPhone */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Animation for the gradient background */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
</style>
