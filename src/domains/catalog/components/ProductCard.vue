<script setup>
import { cart } from '../../cart/store';

const props = defineProps({ // Assign props to variable to use in script if needed
    product: {
        type: Object,
        required: true
    }
});

const handleOrder = () => {
    cart.addToCart(props.product);
    // Optional: Toast notification could go here
    // alert("Producto agregado!"); 
};
</script>

<template>
    <div class="product-card">
        <div class="card-image">
            <!-- Using the placeholder if no image provided, or the asset -->
            <img :src="product.image || '/assets/ejemplo.avif'" :alt="product.title" loading="lazy">
            <span class="price-tag">{{ product.price }}</span>
        </div>
        <div class="card-content">
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <button class="btn-order" @click.stop="handleOrder">
                {{ $t('catalog.add_to_cart') }}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.card-image {
    position: relative;
    height: 250px;
    background-color: #f0f0f0;
    overflow: hidden;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.product-card:hover .card-image img {
    transform: scale(1.05);
}

.price-tag {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 700;
    color: #1a1a1a;
    font-size: 0.95rem;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.card-content {
    padding: 25px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.card-content h3 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: #1a1a1a;
}

.card-content p {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
    flex-grow: 1; /* Pushes button down if text is short */
}

.btn-order {
    background-color: #1a1a1a;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background-color 0.3s ease, gap 0.3s ease;
    width: 100%;
}

.btn-order:hover {
    background-color: #D99578;
    gap: 15px;
}
</style>
