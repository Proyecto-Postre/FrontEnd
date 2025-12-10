<script setup>
import { cart } from '../store'; // Adjust import based on location
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const cartItems = computed(() => cart.items);

const increase = (id) => {
    const item = cart.items.find(i => i.id === id);
    if (item) cart.updateQuantity(id, item.quantity + 1);
};

const decrease = (id) => {
    const item = cart.items.find(i => i.id === id);
    if (item) cart.updateQuantity(id, item.quantity - 1);
};

const remove = (id) => cart.removeFromCart(id);

const checkout = () => {
    if (cart.items.length === 0) return;

    // Build WhatsApp Message
    let message = t('cart.whatsapp_msg');
    
    cart.items.forEach(item => {
        message += `• *${item.title}* (x${item.quantity}) - S/ ${(parseFloat(item.price.replace('S/ ', '')) * item.quantity).toFixed(2)}\n`;
    });

    message += `\nSubtotal: S/ ${cart.subtotal.toFixed(2)}`;

    if (cart.coupon) {
        message += `\nDescuento (${cart.coupon.code}): -S/ ${cart.discountAmount.toFixed(2)}`;
    }
    
    message += `\n\n*${t('cart.total')}: S/ ${cart.totalPrice.toFixed(2)}*`;
    message += "\n\nQuedo atento a la confirmación.";

    const phoneNumber = "51998265700"; // Replace with real number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    
    // Consume coupon after checkout
    if (cart.coupon) {
        cart.removeCoupon();
    }
};
</script>

<template>
    <div class="cart-container container">
        <h2 class="cart-title">Tu Carrito de Compras 🛒</h2>

        <div v-if="cartItems.length > 0" class="cart-content">
            <div class="cart-items">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                    <img :src="item.image || '/assets/ejemplo.avif'" :alt="item.title" class="item-img">
                    
                    <div class="item-details">
                        <h3>{{ item.title }}</h3>
                        <p class="item-price">{{ item.price }}</p>
                    </div>

                    <div class="item-actions">
                        <div class="quantity-controls">
                            <button @click="decrease(item.id)">-</button>
                            <span>{{ item.quantity }}</span>
                            <button @click="increase(item.id)">+</button>
                        </div>
                        <button class="btn-remove" @click="remove(item.id)" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="cart-summary">
                <div class="summary-card">
                    <h3>Resumen del Pedido</h3>
                    
                    <div class="summary-items-list">
                        <div v-for="item in cart.items" :key="item.id" class="summary-item-group">
                            <div class="summary-item-row">
                                <span class="item-name">{{ item.title }} (x{{ item.quantity }})</span>
                                <span class="item-price">S/ {{ (parseFloat(item.price.replace('S/ ', '')) * item.quantity).toFixed(2) }}</span>
                            </div>
                            
                            <!-- Coupon Selection Logic -->
                            <div v-if="cart.coupon" class="coupon-action">
                                <!-- State 1: Coupon Active but this item NOT selected -->
                                <button 
                                    v-if="cart.coupon.targetId !== item.id" 
                                    class="btn-select-coupon"
                                    @click="cart.setCouponTarget(item.id)"
                                >
                                    Aplicar cupón aquí
                                </button>

                                <!-- State 2: This item IS selected -->
                                <div v-else class="coupon-applied-msg">
                                    <span>Descuento ({{ cart.coupon.code }})</span>
                                    <span>- S/ {{ cart.discountAmount.toFixed(2) }}</span>
                                    <button @click="cart.setCouponTarget(null)" class="btn-deselect" title="Cambiar">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="summary-row total">
                        <span>Total a Pagar:</span>
                        <span>S/ {{ cart.totalPrice.toFixed(2) }}</span>
                    </div>
                    <button class="btn-checkout" @click="checkout">
                        Finalizar Pedido por WhatsApp
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="empty-cart">
            <p>El carrito está vacío 😢</p>
            <RouterLink to="/menu" class="btn-link">Ir a ver el Menú</RouterLink>
        </div>
    </div>
</template>

<style scoped>
.cart-container {
    padding: 60px 20px;
    min-height: 70vh;
}

.cart-title {
    font-family: var(--heading-font-family);
    color: var(--text-color);
    margin-bottom: 40px;
    font-size: 2rem;
}

.cart-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

@media (max-width: 900px) {
    .cart-content {
        grid-template-columns: 1fr;
    }
}

.cart-item {
    display: flex;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.03);
    gap: 20px;
}

.item-img {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    object-fit: cover;
}

.item-details {
    flex-grow: 1;
}

.item-details h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: var(--text-color);
}

.item-price {
    font-weight: 700;
    color: var(--primary-color);
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.quantity-controls {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 50px;
    padding: 5px;
}

.quantity-controls button {
    background: none;
    border: none;
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-color);
}

.quantity-controls span {
    width: 30px;
    text-align: center;
    font-weight: 700;
}

.btn-remove {
    background: #fff0f0;
    border: none;
    color: red;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.btn-remove:hover {
    background: #ffe0e0;
}

/* Summary Card */
.summary-card {
    background: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    position: sticky;
    top: 100px;
}

.summary-card h3 {
    margin-bottom: 20px;
    font-family: var(--heading-font-family);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #666;
}

.summary-row.total {
    border-top: 2px dashed #eee;
    padding-top: 20px;
    margin-top: 20px;
    font-weight: 700;
    color: var(--text-color);
    font-size: 1.2rem;
}

.btn-checkout {
    background-color: #25D366;
    color: white;
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    margin-top: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.3s;
}

.btn-checkout:hover {
    transform: translateY(-3px);
    background-color: #20bd5a;
}
.empty-cart {
    text-align: center;
    padding: 50px;
    font-size: 1.2rem;
    color: #888;
}
.summary-items-list {
    margin-bottom: 20px;
}

.summary-item-group {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #eee;
}

.summary-item-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: var(--text-color);
    margin-bottom: 5px;
}

.btn-select-coupon {
    font-size: 0.8rem;
    color: var(--primary-color);
    background: none;
    border: 1px solid var(--primary-color);
    border-radius: 12px;
    padding: 2px 8px;
    cursor: pointer;
    margin-top: 5px;
}

.btn-select-coupon:hover {
    background: var(--primary-color);
    color: white;
}

.coupon-applied-msg {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--accent-color);
    font-weight: 600;
    background: #fdf2e9;
    padding: 5px 10px;
    border-radius: 8px;
    margin-top: 5px;
}

.btn-deselect {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: #999;
}

.divider {
    border-top: 2px solid #e0e0e0;
    margin-top: 20px;
}
</style>
