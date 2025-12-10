import { reactive, watch } from 'vue';

const CART_STORAGE_KEY = 'dulcefe_cart';

// Recover state from local storage
const storedCart = localStorage.getItem(CART_STORAGE_KEY);
const initialState = storedCart ? JSON.parse(storedCart) : [];

export const cart = reactive({
    items: initialState,
    coupon: null, // Store applied coupon

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

    // Coupon Actions
    applyCoupon(code) {
        const coupons = {
            'NUEVO15': { code: 'NUEVO15', type: 'percent', value: 0.15, desc: '15% Off' },
            'DULCE20': { code: 'DULCE20', type: 'percent', value: 0.20, desc: '20% Off' }
        };

        if (coupons[code]) {
            this.coupon = { ...coupons[code], targetId: null }; // Initialize with no target
            return true;
        }
        return false;
    },

    setCouponTarget(itemId) {
        if (this.coupon) {
            this.coupon.targetId = itemId;
        }
    },

    removeCoupon() {
        this.coupon = null;
    },

    get totalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    get subtotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace('S/ ', ''));
            return total + (price * item.quantity);
        }, 0);
    },

    get discountAmount() {
        if (!this.coupon || !this.coupon.targetId) return 0;

        const targetItem = this.items.find(i => i.id === this.coupon.targetId);
        if (!targetItem) return 0;

        const price = parseFloat(targetItem.price.replace('S/ ', ''));
        // Discount applies to total value of that item line (price * quantity) OR just unit? 
        // User said "product", usually implies the line item or unit. Let's do line item total for simplicity of "apply to this product".
        // Wait, user said "descuento solo aplique a 1 producto" previously.
        // Let's stick to: Discount applies to the total price of the selected target item line.
        return (price * targetItem.quantity) * this.coupon.value;
    },

    get totalPrice() {
        return this.subtotal - this.discountAmount;
    },

    clearCart() {
        this.items.splice(0, this.items.length);
        this.coupon = null;
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
