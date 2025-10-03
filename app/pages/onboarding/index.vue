<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 1 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 py-6">
      <h1 class="text-2xl font-bold mb-2">Create your profile</h1>
      <p class="text-gray-600 mb-8">
        Add a photo and username so friends can find you
      </p>

      <!-- Profile Photo Upload -->
      <div class="flex flex-col items-center mb-8">
        <div class="relative mb-4">
          <div
            class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <Icon name="ri:user-3-line" size="48" class="text-gray-400" />
          </div>
        </div>
      </div>

      <!-- Form Fields -->
      <form @submit.prevent="handleContinue" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Full Name</label
          >
          <input
            v-model="form.name"
            type="text"
            placeholder="John Doe"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Username</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >@</span
            >
            <input
              v-model="form.username"
              type="text"
              placeholder="johndoe"
              required
              class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            This will be your unique handle
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Bio</label
          >
          <textarea
            v-model="form.bio"
            placeholder="Tell us about yourself..."
            :maxlength="150"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">
            {{ form.bio?.length || 0 }}/150
          </p>
        </div>
      </form>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <button
          @click="handleContinue"
          class="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-center disabled:opacity-50"
        >
          Continue
        </button>
        <NuxtLink
          to="/onboarding/notifications"
          class="block w-full text-center text-purple-600 font-medium text-sm underline hover:text-purple-700"
        >
          Skip for now
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { userModel: user } = useAuth();

const form = reactive({
  name: user.value?.name,
  username: user.value?.username,
  bio: user.value?.biography,
});

const handleContinue = async () => {
  const { error: submitError } = await useDynamicFetch("/api/user", {
    method: "PUT",
    body: {
      name: form.name?.trim(),
      username: form.username?.trim(),
      biography: form.bio?.trim(),
    },
  });

  if (submitError.value) {
    console.error("Failed to save profile:", submitError.value);
    return;
  }

  await navigateTo("/onboarding/notifications");
};
</script>
