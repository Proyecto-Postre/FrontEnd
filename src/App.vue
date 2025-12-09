<script setup>
import { ref, provide } from 'vue';
import { RouterView } from 'vue-router';
import Header from './shared/layout/Header.vue';
import Footer from './shared/layout/Footer.vue';
import Modal from './shared/ui/Modal.vue';

const showModal = ref(false);
const modalType = ref('');

// Global modal handler
const openModal = (type) => {
    modalType.value = type;
    showModal.value = true;
};

// Provide to all children
provide('openModal', openModal);
</script>

<template>
  <Header />
  
  <main>
    <!-- router-view loads the component for the current URL -->
    <RouterView /> 
  </main>

  <Footer />
  
  <!-- Global components -->
  <Modal :isOpen="showModal" :type="modalType" @close="showModal = false" />
</template>
