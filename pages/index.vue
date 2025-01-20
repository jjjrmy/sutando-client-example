<template>
    <div class="container mx-auto p-4">
        <div class="bg-white shadow rounded-lg p-6 mb-6">
            <h1 class="text-2xl font-bold mb-4">User Profile</h1>
            
            <!-- Profile Info -->
            <div class="mb-4">
                <p><strong>ID:</strong> {{ user.id }}</p>
                <p><strong>Full Name:</strong> {{ user.full_name }}</p>
                <p><strong>Created:</strong> {{ user.created_at?.toLocaleString() }}</p>
                <p><strong>Updated:</strong> {{ user.updated_at?.toLocaleString() }}</p>
            </div>

            <!-- Edit Form -->
            <div v-if="isEditing" class="mb-4">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">First Name</label>
                        <input 
                            type="text" 
                            v-model="user.first_name" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            @change="updateField('updated_at', true)"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Last Name</label>
                        <input 
                            type="text" 
                            v-model="user.last_name" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            @change="updateField('updated_at', true)"
                        >
                    </div>
                    <button 
                        @click="isEditing = false" 
                        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Done
                    </button>
                </div>
            </div>
            
            <button 
                v-else
                @click="isEditing = true" 
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Edit Profile
            </button>
        </div>

        <!-- Posts List -->
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4">Posts</h2>
            <div class="space-y-4">
                <div v-for="post in user.posts" :key="post.id" class="flex justify-between items-center p-4 border rounded">
                    <div>{{ post.title }}</div>
                    <button 
                        @click="removePost(post.id)" 
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Remove
                    </button>
                </div>
                <div v-if="!user.posts?.length" class="text-gray-500">
                    No posts found
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { make } from 'sutando';
import User from '~/models/User';
import Post from '~/models/Post';

function modelRef(value: any = null) {
  const _value = ref(value);
  const skipNextWatch = ref(false);

  watch(_value, () => {
    if (skipNextWatch.value) {
      skipNextWatch.value = false;
      return;
    }
    skipNextWatch.value = true;
    triggerRef(_value);
  }, { deep: true });

  return _value;
}

const user = modelRef();
const { data: userData, refresh } = await useFetch('/api/user');
watch(userData, (newData) => {
  user.value = make(User, newData);
}, { immediate: true, deep: true })

const isEditing = ref(false);

function updateField(field: string, value: boolean) {
    user.value[field] = value ? new Date() : null;
}

function removePost(id: number) {
    user.value.posts = user.value.posts.filter((post: Post) => post.id !== id);
}
</script>
