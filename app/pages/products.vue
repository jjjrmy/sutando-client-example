<script setup lang="ts">
definePageMeta({
  auth: false,
});

const config = useRuntimeConfig();
const { client: authClient } = useAuth();

const upgrade = async () => {
  const { data, error } = await authClient.subscription.upgrade({
    plan: "basic",
    successUrl: `${config.public.appUrl}/products?success=true`, // required
    cancelUrl: `${config.public.appUrl}/products?cancel=true`, // required
    returnUrl: `${config.public.appUrl}/products?return=true`,
    disableRedirect: false, // required
  });
};
</script>

<template>
  <div>
    <h1>Products</h1>
    <button
      type="button"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      @click="upgrade"
    >
      Upgrade
    </button>
  </div>
</template>

<style scoped></style>
