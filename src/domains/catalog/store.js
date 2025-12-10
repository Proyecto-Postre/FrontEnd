import { reactive, ref } from 'vue';

export const catalog = reactive({
    items: [],
    loading: false,
    error: null,

    async fetchProducts() {
        // Always fetch fresh data to reflect Admin changes immediately

        this.loading = true;
        this.error = null;
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            this.items = await response.json();
        } catch (err) {
            console.error('Error fetching products:', err);
            this.error = err.message;
        } finally {
            this.loading = false;
        }
    }
});
