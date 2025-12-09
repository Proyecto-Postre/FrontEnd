<script setup>
import ContactForm from '../domains/contact/components/ContactForm.vue';
</script>

<template>
    <div class="page-view contact-view">
        <div class="page-header">
            <h1>Contáctanos</h1>
            <p>Estamos aquí para endulzar tu día</p>
        </div>
        <ContactForm />
    </div>
</template>

<style scoped>
.page-header {
    background-color: var(--primary-color);
    color: white;
    padding: 60px 0 60px;
    text-align: center;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    margin-bottom: 40px;
}
.page-header h1 {
    font-size: 3rem;
    font-weight: 700;
}
</style>
