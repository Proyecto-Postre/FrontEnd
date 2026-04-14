<script setup>
import { ref, provide, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from './shared/layout/Header.vue';
import Footer from './shared/layout/Footer.vue';
import Modal from './shared/ui/Modal.vue';
import { authStore } from './domains/auth/store.js';

const showModal = ref(false);
const modalType = ref('');

// Global modal handler
const openModal = (type) => {
    modalType.value = type;
    showModal.value = true;
};

// Provide to all children
provide('openModal', openModal);

// Global Authentication Check on Startup
onMounted(async () => {
    if (authStore.isLoggedIn) {
        try {
            const res = await fetch('/api/v1/users/me', {
                headers: { ...authStore.authHeaders }
            });
            if (res.status === 401 || res.status === 403) {
                console.log('Session expired. Logging out automatically.');
                authStore.logout(); // The token is no longer valid
            } else if (res.ok) {
                const freshUser = await res.json();
                authStore.updateUser(freshUser); // Keep profile cleanly synced
            }
        } catch (e) {
            console.warn('Network error or API down during startup auth check');
        }
    }
});
</script>

<template>
  <Header />
  
  <main class="app-main">
    <!-- router-view loads the component for the current URL -->
    <RouterView /> 
  </main>

  <Footer />
  
  <!-- Global components -->
  <Modal :isOpen="showModal" :type="modalType" @close="showModal = false" />
</template>

<style>
.app-main {
    /* New header has 2 rows: brand bar (~55px) + nav row (~52px) = ~107px */
    padding-top: 107px;
}
</style>
