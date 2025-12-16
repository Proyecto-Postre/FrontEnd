<script setup>
import Hero from '../domains/marketing/components/Hero.vue';
import Marquee from '../domains/marketing/components/Marquee.vue';
import CatalogSection from '../domains/catalog/components/CatalogSection.vue'; // We can reuse logic or make a Preview
import AboutSection from '../domains/brand/components/AboutSection.vue';
import TestimonialsSection from '../domains/marketing/components/TestimonialsSection.vue';
import ContactForm from '../domains/contact/components/ContactForm.vue';

// For Home, maybe we want just a preview of Catalog? 
// For now, let's include the full sections as per user "Inicio" request (Aggregator)
/* The user said: "el inicio tendra un poquito de los demas"
   So ideally we should have mini-versions. 
   To save time/complexity, I will reuse the full sections for now,
   but maybe hide the detailed filters in Catalog if possible, or just show it as 'Featured'.
   Actually, the CatalogSection is already quite nice. Let's use it.
*/
</script>

<template>
    <div class="home-view">
        <Hero />
        <!-- Marquee is inside Hero in current implementation or separate? Let's check Hero.vue -->
        <!-- Just checking Hero.vue previously, it imports Marquee. So good. -->
        
        <div class="section-spacer"></div>
        
        <!-- Short About Teaser -->
        <AboutSection />
        
        <!-- Catalog Preview -->
        <!-- Catalog Preview -->
        <CatalogSection mode="featured" />

        <div class="section-spacer"></div>

        <!-- Social Proof -->
        <TestimonialsSection />

        <ContactForm />
    </div>
</template>

<style scoped>
.section-spacer {
    height: 50px;
}
</style>
