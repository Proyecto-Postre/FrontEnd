<script setup>
import { ref, provide, onMounted, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Header from './shared/layout/Header.vue';
import Footer from './shared/layout/Footer.vue';
import Modal from './shared/ui/Modal.vue';
import { apiFetch } from './api.js';
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
const isAdminPage = computed(() => route.path.startsWith('/admin'));
const showNavbar = computed(() => !isAuthPage.value && !isAdminPage.value);
const showFooter = computed(() => !isAuthPage.value && !isAdminPage.value);

// Global Authentication Check on Startup
onMounted(async () => {
    if (authStore.isLoggedIn) {
        try {
            const res = await apiFetch('/api/v1/users/me');
            if (res.status === 401 || res.status === 403) {
                console.warn('[AUTH] Session expired or invalid, skipping silent refresh.');
            } else if (res.ok) {
                const freshUser = await res.json();
                authStore.updateUser(freshUser);
            }
        } catch (e) {
            // Silently fail startup check
        }
    }
});
</script>

<template>
  <Header v-if="!isAuthPage" />
  
  <main :class="{ 'app-main': !isAuthPage && !isAdminPage, 'admin-main': isAdminPage, 'auth-main': isAuthPage }">
    <!-- router-view loads the component for the current URL -->
    <RouterView :key="$route.fullPath" /> 
  </main>

  <Footer v-if="!isAuthPage" />
  
  <!-- Global components -->
  <Modal :isOpen="showModal" :type="modalType" @close="showModal = false" />
</template>

<style>
.app-main, .admin-main {
    padding-top: 107px;
    min-height: 100vh;
}

.admin-main {
    background: #fbf9f6;
}

.auth-main {
    min-height: 100vh;
    padding: 0;
    margin: 0;
}
</style>
