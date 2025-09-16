<!-- Users List Page -->
<template>
  <div class="container mx-auto p-4">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Users</h1>
        <div class="flex space-x-2">
          <NuxtLink
            to="/user/new"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create User
          </NuxtLink>
          <button
            type="button"
            @click="refresh()"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh List
          </button>
          <button
            v-if="session"
            type="button"
            @click="authClient.signOut()"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
          <button
            v-if="!session"
            type="button"
            @click="navigateTo('/auth')"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
        >
          <div>
            <h3 class="font-medium">{{ user.full_name }}</h3>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">
              Posts: {{ user.posts?.count() ?? 0 }}
            </p>
          </div>
          <div class="flex space-x-2">
            <NuxtLink
              :to="`/user/${user.id}`"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Profile
            </NuxtLink>
          </div>
        </div>
        <div v-if="users.isEmpty()" class="text-gray-500 text-center py-4">
          No users found
        </div>

        <pre>{{ session }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { make } from "sutando";
import User from "../../models/User";

const authClient = useAuth();
const { data: session } = await authClient.useSession(useDynamicFetch);

const users = ref();

const { data: usersData, refresh } = await useFetch("/api/user");

watch(
  usersData,
  (newData) => {
    users.value = make(User as any, newData);
  },
  { immediate: true, deep: true }
);
</script>
