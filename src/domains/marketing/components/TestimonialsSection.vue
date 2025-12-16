<script setup>
import { ref, onMounted, computed } from 'vue';

const testimonials = ref([]);
const user = ref(null);
const showForm = ref(false);

const newReview = ref({
    text: '',
    stars: 5,
});

onMounted(async () => {
    // 1. Fetch Reviews
    try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
            const allReviews = await res.json();
            
            // Filter: Show 'isSelected' ones first
            const selected = allReviews.filter(r => r.isSelected);
            
            if (selected.length > 0) {
                // If admin has curated reviews, show ONLY them (or sorted by them)
                testimonials.value = selected;
            } else {
                // Fallback: Show newest 3
                testimonials.value = allReviews.reverse().slice(0, 3);
            }
        }
    } catch (e) {
        console.error("Error fetching testimonials", e);
    }

    // 2. Check User
    const stored = localStorage.getItem('user');
    if (stored) {
        user.value = JSON.parse(stored);
    }
});

const submitReview = async () => {
    if (!newReview.value.text) return;

    const reviewData = {
        id: Date.now(),
        name: `${user.value.name} ${user.value.lastName.charAt(0)}.`,
        text: newReview.value.text,
        stars: newReview.value.stars,
        role: "Cliente Verificado"
    };

    // Optimistic UI Update
    testimonials.value.unshift(reviewData); 

    try {
        await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        // Reset form
        newReview.value.text = '';
        newReview.value.stars = 5;
        showForm.value = false;
        alert("¡Gracias por tu opinión! ❤️");
    } catch (e) {
        alert("Hubo un error al guardar tu reseña.");
    }
};
</script>

<template>
    <section class="testimonials-section">
        <div class="container">
            <div class="header">
                <h2>Lo que dicen nuestros clientes ❤️</h2>
                <p>Historias dulces de personas reales.</p>
                
                <div class="cta-review">
                    <button v-if="user && !showForm" @click="showForm = true" class="btn-write">
                        ✍️ Escribir una reseña
                    </button>
                    <p v-if="!user" class="login-hint">
                        <router-link to="/login">Inicia sesión</router-link> para dejar tu opinión.
                    </p>
                </div>
            </div>

            <!-- REVIEW FORM -->
            <transition name="slide-fade">
                <div v-if="showForm" class="review-form-container">
                    <form @submit.prevent="submitReview" class="glass-form-sc">
                        <h4>Comparte tu experiencia</h4>
                        <div class="rating-select">
                            <span 
                                v-for="n in 5" :key="n" 
                                @click="newReview.stars = n"
                                :class="{ active: n <= newReview.stars }"
                            >★</span>
                        </div>
                        <textarea 
                            v-model="newReview.text" 
                            placeholder="¿Qué fue lo que más te gustó?" 
                            rows="3"
                            required
                        ></textarea>
                        <div class="form-actions">
                            <button type="button" @click="showForm = false" class="btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-submit">Publicar</button>
                        </div>
                    </form>
                </div>
            </transition>

            <div v-if="testimonials.length > 0" class="grid">
                <div v-for="item in testimonials.slice(0, 6)" :key="item.id" class="review-card">
                    <div class="stars">
                        <span v-for="n in 5" :key="n" :class="{ filled: n <= item.stars }">★</span>
                    </div>
                    <p class="text">"{{ item.text }}"</p>
                    <div class="author">
                        <div class="avatar">{{ item.name.charAt(0) }}</div>
                        <div class="info">
                            <span class="name">{{ item.name }}</span>
                            <span class="role">{{ item.role }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <p>Aún no hay reseñas. ¡Sé el primero en contarnos tu experiencia!</p>
            </div>
        </div>
    </section>
</template>

<style scoped>
.testimonials-section {
    padding: 80px 0;
    background-color: #FAFAFA;
}

.header {
    text-align: center;
    margin-bottom: 50px;
}

.header h2 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 10px;
    font-family: var(--heading-font-family);
}

.cta-review {
    margin-top: 20px;
}

.btn-write {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 50px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-write:hover { transform: scale(1.05); }

.login-hint a {
    color: var(--primary-color);
    font-weight: 700;
    text-decoration: none;
}

/* FORM STYLES */
.review-form-container {
    max-width: 500px;
    margin: 0 auto 40px;
}

.glass-form-sc {
    background: white;
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
    border: 1px solid var(--primary-color);
}

.rating-select {
    font-size: 2rem;
    color: #ddd;
    cursor: pointer;
    margin-bottom: 15px;
}

.rating-select span.active { color: #FFD700; }

.glass-form-sc textarea {
    width: 100%;
    border: 2px solid #eee;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 15px;
    font-family: inherit;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.btn-submit {
    background: var(--primary-color);
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
}

.btn-cancel {
    background: transparent;
    color: #888;
    border: none;
    cursor: pointer;
}

/* CARDS */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.review-card {
    background: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
}

.stars { color: #ddd; font-size: 1.5rem; margin-bottom: 20px; }
.stars span.filled { color: #FFD700; }

.text {
    font-style: italic;
    color: var(--text-color);
    margin-bottom: 25px;
    flex-grow: 1;
}

.author {
    display: flex;
    align-items: center;
    gap: 15px;
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
}

.avatar {
    width: 45px; height: 45px;
    background: var(--accent-color);
    color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
}

.info { display: flex; flex-direction: column; }
.name { font-weight: 700; color: var(--primary-dark); }
.role { font-size: 0.85rem; color: #888; }

.empty-state {
    text-align: center;
    padding: 40px;
    color: #888;
    font-size: 1.1rem;
    font-style: italic;
    background: white;
    border-radius: 20px;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 5px 15px rgba(0,0,0,0.03);
}
</style>
