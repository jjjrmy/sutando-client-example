<!-- User Detail Page -->
<template>
    <div class="container mx-auto p-4">
        <div class="bg-white shadow rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">User Profile</h1>
                <NuxtLink to="/" class="text-blue-500 hover:text-blue-600">← Back to Users</NuxtLink>
            </div>
            
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
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Last Name</label>
                        <input 
                            type="text" 
                            v-model="user.last_name" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            @click="saveChanges" 
                            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Save Changes
                        </button>
                        <button 
                            @click="cancelEdit" 
                            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            
            <div v-else class="flex space-x-2">
                <button 
                    @click="startEdit" 
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Edit Profile
                </button>
                <button 
                    @click="refresh" 
                    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Refresh Data
                </button>
            </div>
        </div>

        <!-- Posts List -->
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4">Posts <small>{{ user.has_edited_posts ? 'has edited posts' : 'no edited posts' }}</small></h2>
            <div class="space-y-4">
                <div v-for="post in user.posts" :key="post.id" class="flex space-x-4 items-center p-4 border rounded">
                    <NuxtLink :to="`/post/${post.id}`">{{ post.title }}</NuxtLink>
                    <div class="text-sm text-gray-600">{{ post.was_edited ? 'edited' : 'not edited' }}</div>
                    <div class="!ml-auto flex space-x-2">
                        <button 
                            @click="editPost(post.id)" 
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Edit
                        </button>
                        <button 
                            @click="removePost(post.id)" 
                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            Remove
                        </button>
                    </div>
                    
                </div>
                <div v-if="user.posts.isEmpty()" class="text-gray-500">
                    No posts found
                </div>
                <NuxtLink 
                    :to="`/post/create?user_id=${user.id}`"
                    class="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Create New Post
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { make } from 'sutando';
import User from '~/models/User';
import Post from '~/models/Post';
import { modelRef } from '~/utils/model';

const route = useRoute();
const user = modelRef();
const originalUserData = ref(null);
const isEditing = ref(false);

const { data: userData, refresh } = await useFetch(`/api/user/${route.params.id}`);
watch(userData, (newData) => {
    user.value = make(User, newData);
    originalUserData.value = JSON.parse(JSON.stringify(newData));
}, { immediate: true, deep: true });

function startEdit() {
    isEditing.value = true;
}

function cancelEdit() {
    user.value = make(User, JSON.parse(JSON.stringify(originalUserData.value)));
    isEditing.value = false;
}

async function saveChanges() {
    try {
        await $fetch(`/api/user/${user.value.id}`, {
            method: 'PUT',
            body: {
                first_name: user.value.first_name,
                last_name: user.value.last_name,
                email: user.value.email
            }
        });
        await refresh();
        isEditing.value = false;
    } catch (error) {
        console.error('Failed to save changes:', error);
        // You might want to add error handling UI here
    }
}

function editPost(id: number) {
    const post = user.value.posts.firstWhere('id', id);
    post.title = 'Edited Title';
    post.updated_at = new Date();
}

function removePost(id: number) {
    user.value.setRelation('posts', user.value.posts.filter((post: Post) => post.id !== id));
}
</script> 