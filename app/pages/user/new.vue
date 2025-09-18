<!-- Create New User Page -->
<template>
  <div class="container mx-auto p-4">
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Create User</h1>
        <NuxtLink to="/" class="text-blue-500 hover:text-blue-600"
          >← Back to Users</NuxtLink
        >
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            v-model="form.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            v-model="form.email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div class="flex space-x-2">
          <button
            @click="createUser"
            :disabled="isSubmitting"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-60"
          >
            {{ isSubmitting ? "Creating..." : "Create User" }}
          </button>
          <NuxtLink
            to="/"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const isSubmitting = ref(false);
const form = reactive({
  name: "",
  email: "",
});

async function createUser() {
  try {
    isSubmitting.value = true;
    const created = await $fetch("/api/user", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
      },
    });
    const id = (created as any)?.id;
    if (id) {
      await router.push(`/user/${id}`);
    }
  } catch (error) {
    console.error("Failed to create user:", error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
