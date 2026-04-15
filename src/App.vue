<script setup>
import { ref, provide, onMounted, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
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

const route = useRoute();
const isAuthPage = computed(() => ['login', 'register'].includes(route.name));

// Global Authentication Check on Startup
onMounted(async () => {
    if (authStore.isLoggedIn) {
        try {
            const res = await fetch('/api/v1/users/me', {
                headers: { ...authStore.authHeaders }
            });
            if (res.status === 401 || res.status === 403) {
                console.warn('Profile fetch failed during refresh, keeping existing session info.');
                // We do NOT logout() here to avoid breaking persistence when profile endpoint has issues
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
  <Header v-if="!isAuthPage" />
  
  <main :class="{ 'app-main': !isAuthPage, 'auth-main': isAuthPage }">
    <!-- router-view loads the component for the current URL -->
    <RouterView /> 
  </main>

  <Footer v-if="!isAuthPage" />
  
  <!-- Global components -->
  <Modal :isOpen="showModal" :type="modalType" @close="showModal = false" />
</template>

<style>
.app-main {
    /* New header has 2 rows: brand bar (~55px) + nav row (~52px) = ~107px */
    padding-top: 107px;
}

.auth-main {
    min-height: 100vh;
    padding: 0;
    margin: 0;
}
</style>
