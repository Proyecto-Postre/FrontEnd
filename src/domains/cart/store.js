import { reactive, watch } from 'vue';

const CART_STORAGE_KEY = 'dulcefe_cart';

// Recover state from local storage
const storedCart = localStorage.getItem(CART_STORAGE_KEY);
const initialState = storedCart ? JSON.parse(storedCart) : [];

export const cart = reactive({
    items: initialState,

    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
    },

    removeFromCart(productId) {
        const index = this.items.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            }
        }
    },

    get totalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    get totalPrice() {
        return this.items.reduce((total, item) => {
            // Remove "S/ " and convert to float
            const price = parseFloat(item.price.replace('S/ ', ''));
            return total + (price * item.quantity);
        }, 0);
    },

    clearCart() {
        this.items.splice(0, this.items.length);
    }
});

// Watch for changes to persist
watch(
    () => cart.items,
    (items) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    },
    { deep: true }
);
