<template>
  <div class="pt-safe">
    <h1>Dashboard</h1>
    <p>Welcome to the dashboard</p>
    <pre>{{ user }}</pre>
    <pre>{{ subscriptions }}</pre>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/products">Products</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { user, client } = useAuth();

const { data: subscriptions } = await client.subscription.list();
</script>

<style scoped></style>
