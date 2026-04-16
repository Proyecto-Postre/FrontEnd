<script setup>
import { ref, onMounted, computed, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { authStore } from '../../auth/store.js';

const { t } = useI18n();

// ─── State ──────────────────────────────────────────────────
const activeTab = ref('orders'); // 'orders' | 'inventory' | 'users' | 'analytics' | 'reviews'
const products = ref([]);
const users = ref([]);
const orders = ref([]);
const testimonials = ref([]);
const reviewsSearch = ref('');
const isEditing = ref(false);
const currentProduct = ref({});
const fileName = ref('');

const emptyProduct = {
    title: '',
    price: '',
    description: '',
    category: 'Tortas',
    image: '',
    popular: false,
    isFeatured: false,
    sales: 0
};

// ─── Data Fetching ──────────────────────────────────────────
// ─── Data Fetching ──────────────────────────────────────────
const fetchData = async () => {
    try {
        console.log('[DEBUG] Admin dashboard fetching fresh data...');
        const headers = { ...authStore.authHeaders };
        
        const [prodRes, userRes, orderRes, testRes] = await Promise.all([
            fetch('/api/v1/admin/products', { headers }),
            fetch('/api/v1/users', { headers }),
            fetch('/api/v1/admin/orders', { headers }),
            fetch('/api/v1/admin/testimonials', { headers })
        ]);

        if (prodRes.ok) products.value = await prodRes.json();
        if (userRes.ok) users.value = await userRes.json();
        if (orderRes.ok) orders.value = (await orderRes.json()).reverse();
        if (testRes.ok) testimonials.value = await testRes.json();
        
    } catch (e) {
        console.error("Error fetching dashboard data:", e);
    }
};

onMounted(fetchData);

// ─── Analytics Helpers ──────────────────────────────────────
const topSellingProducts = computed(() => {
    return [...products.value].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
});

const maxSales = computed(() => {
    return Math.max(...products.value.map(p => p.sales || 0), 100);
});

const totalRevenue = computed(() => {
    return orders.value.reduce((acc, order) => acc + (order.total || 0), 0);
});

// ─── Filters ────────────────────────────────────────────────
const filteredTestimonials = computed(() => {
    if (!reviewsSearch.value) return testimonials.value;
    const q = reviewsSearch.value.toLowerCase();
    return testimonials.value.filter(t => t.name.toLowerCase().includes(q));
});

// ─── Actions ────────────────────────────────────────────────
const updateOrderStatus = async (order, newStatus) => {
    try {
        await fetch(`/api/v1/orders/${order.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                ...authStore.authHeaders
            },
            body: JSON.stringify({ status: newStatus })
        });
        order.status = newStatus;
    } catch(e) { alert("Error updating status"); }
};

const deleteProduct = async (id) => {
    if (!confirm(t('admin.alerts.confirm_delete_product'))) return;
    try {
        await fetch(`/api/v1/admin/products/${id}`, { 
            method: 'DELETE',
            headers: { ...authStore.authHeaders }
        });
        products.value = products.value.filter(p => p.id !== id);
    } catch (e) { alert(t('admin.alerts.error_delete_product')); }
};

const saveProduct = async () => {
    const isNew = !currentProduct.value.id;
    const url = isNew ? '/api/v1/admin/products' : `/api/v1/admin/products/${currentProduct.value.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // Format price if needed
    if (currentProduct.value.price && !currentProduct.value.price.toString().startsWith('S/ ')) {
        const cleanVal = currentProduct.value.price.toString().replace(/[^0-9.]/g, '');
        currentProduct.value.price = `S/ ${parseFloat(cleanVal).toFixed(2)}`;
    }

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                ...authStore.authHeaders
            },
            body: JSON.stringify(currentProduct.value)
        });
        if (res.ok) {
            await fetchData();
            isEditing.value = false;
        }
    } catch (e) { alert(t('admin.alerts.error_save')); }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        fileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (e) => { currentProduct.value.image = e.target.result; };
        reader.readAsDataURL(file);
    }
};

const toggleTestimonialSelection = async (review) => {
    if (!review.isSelected && testimonials.value.filter(t => t.isSelected).length >= 3) {
        alert("Máximo 3 testimonios");
        return;
    }
    try {
        const newVal = !review.isSelected;
        await fetch(`/api/v1/testimonials/${review.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                ...authStore.authHeaders
            },
            body: JSON.stringify({ isSelected: newVal })
        });
        review.isSelected = newVal;
    } catch (e) { alert("Error al actualizar"); }
};

const deleteTestimonial = async (id) => {
    if (!confirm("¿Eliminar comentario?")) return;
    try {
        await fetch(`/api/v1/testimonials/${id}`, { 
            method: 'DELETE',
            headers: { ...authStore.authHeaders }
        });
        testimonials.value = testimonials.value.filter(t => t.id !== id);
    } catch (e) { alert("Error al eliminar"); }
};
</script>

<template>
    <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span class="leaf">🌿</span>
                <h2>Admin Console</h2>
            </div>

            <nav class="sidebar-nav">
                <button @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    Pedidos
                </button>
                <button @click="activeTab = 'inventory'" :class="{ active: activeTab === 'inventory' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Inventario
                </button>
                <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Usuarios
                </button>
                <button @click="activeTab = 'analytics'" :class="{ active: activeTab === 'analytics' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    Métricas
                </button>
                <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Reseñas
                </button>
            </nav>

            <div class="sidebar-footer">
                <p>Admin: {{ authStore.displayName }}</p>
                <button @click="authStore.logout(); $router.push('/')" class="logout-btn">Salir</button>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-viewport">
            <!-- Header Stats -->
            <section class="stats-grid">
                <div class="stat-card">
                    <span class="label">Total Pedidos</span>
                    <span class="value">{{ orders.length }}</span>
                </div>
                <div class="stat-card highlight">
                    <span class="label">Ingresos</span>
                    <span class="value">S/ {{ totalRevenue.toFixed(2) }}</span>
                </div>
                <div class="stat-card">
                    <span class="label">Productos</span>
                    <span class="value">{{ products.length }}</span>
                </div>
                <div class="stat-card">
                    <span class="label">Usuarios</span>
                    <span class="value">{{ users.length }}</span>
                </div>
            </section>

            <!-- Table Sections -->
            <section class="content-body shadow-card">
                <!-- Orders Tab -->
                <div v-if="activeTab === 'orders'">
                    <div class="table-header">
                        <h2>Pedidos Recientes</h2>
                    </div>
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Monto</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" :key="order.id">
                                <td>{{ new Date(order.timestamp || order.date).toLocaleDateString() }}</td>
                                <td>{{ order.userName }}</td>
                                <td class="bold">S/ {{ order.total.toFixed(2) }}</td>
                                <td>
                                    <select 
                                        :value="order.status" 
                                        @change="updateOrderStatus(order, $event.target.value)"
                                        class="status-dropdown" :class="order.status"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="atendido">Atendido</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Inventory Tab -->
                <div v-if="activeTab === 'inventory'">
                    <div class="table-header">
                        <h2>Gestión de Inventario</h2>
                        <button class="btn-primary" @click="isEditing = true; currentProduct = { ...emptyProduct }">+ Nuevo Producto</button>
                    </div>
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>Img</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in products" :key="p.id">
                                <td><img :src="p.image" class="thumb-round"></td>
                                <td>{{ p.title }}</td>
                                <td class="bold">{{ p.price }}</td>
                                <td><span class="tag">{{ p.category }}</span></td>
                                <td class="actions">
                                    <button @click="currentProduct = { ...p }; isEditing = true" class="btn-edit">✏️</button>
                                    <button @click="deleteProduct(p.id)" class="btn-delete">🗑️</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Users Tab -->
                <div v-if="activeTab === 'users'">
                    <div class="table-header">
                        <h2>Usuarios del Sistema</h2>
                    </div>
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td>{{ u.name || (u.firstName + ' ' + u.lastName) }}</td>
                                <td>{{ u.email }}</td>
                                <td><span class="tag role" :class="u.role">{{ u.role || 'user' }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Metrics Tab -->
                <div v-if="activeTab === 'analytics'" class="analytics-pane">
                    <div class="table-header">
                        <h2>Rendimiento de Ventas</h2>
                    </div>
                    <div class="bars-container">
                        <div v-for="p in topSellingProducts" :key="p.id" class="bar-row">
                            <span class="bar-label">{{ p.title }}</span>
                            <div class="bar-track">
                                <div class="bar-fill" :style="{ width: (p.sales / maxSales * 100) + '%' }">
                                    <span class="bar-value">{{ p.sales }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div v-if="activeTab === 'reviews'">
                    <div class="table-header">
                        <h2>Comentarios de Clientes</h2>
                        <input v-model="reviewsSearch" placeholder="🔍 Buscar autor..." class="sub-search">
                    </div>
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Comentario</th>
                                <th>Estrellas</th>
                                <th>Inicio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in filteredTestimonials" :key="r.id">
                                <td class="bold">{{ r.name }}</td>
                                <td class="long-text">{{ r.text }}</td>
                                <td class="stars">{{ '★'.repeat(r.stars) }}</td>
                                <td>
                                    <button @click="toggleTestimonialSelection(r)" :class="{ picked: r.isSelected }" class="btn-pin">
                                        📌
                                    </button>
                                </td>
                                <td><button @click="deleteTestimonial(r.id)" class="btn-delete">🗑️</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        <!-- Edit Modal Overlay -->
        <div v-if="isEditing" class="modal-backdrop">
            <div class="modal-card animator-slide-up">
                <h3>{{ currentProduct.id ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
                <form @submit.prevent="saveProduct" class="modern-form">
                    <div class="g-2">
                        <div class="field">
                            <label>Nombre</label>
                            <input v-model="currentProduct.title" required>
                        </div>
                        <div class="field">
                            <label>Precio</label>
                            <input v-model="currentProduct.price" required placeholder="0.00">
                        </div>
                    </div>
                    <div class="field">
                        <label>Categoría</label>
                        <select v-model="currentProduct.category">
                            <option>Tortas</option>
                            <option>Postres</option>
                            <option>Bebidas</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Imagen</label>
                        <div class="file-box">
                            <input type="file" @change="handleFileUpload" id="adm-up">
                            <label for="adm-up" class="file-btn">Seleccionar Archivo</label>
                            <span>{{ fileName || 'Ninguna imagen seleccionada' }}</span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Descripción</label>
                        <textarea v-model="currentProduct.description" rows="3"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" @click="isEditing = false" class="btn-ghost">Cancelar</button>
                        <button type="submit" class="btn-solid">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Reset & Container ─────────────────────────────────────── */
.admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f8faf9;
    color: #2c3e50;
    font-family: var(--body-font-family);
}

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
    width: 260px;
    background: #1e2925;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 30px 20px;
    position: sticky;
    top: 0;
    height: 100vh;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
}
.sidebar-brand h2 { font-size: 1.2rem; font-weight: 700; color: #4a7c6a; }
.sidebar-brand .leaf { font-size: 1.4rem; }

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.sidebar-nav button {
    background: transparent;
    border: none;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 10px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.sidebar-nav button:hover, .sidebar-nav button.active {
    background: #4a7c6a;
    color: white;
}

.sidebar-footer {
    padding-top: 20px;
    border-top: 1px solid #ffffff1a;
}
.logout-btn { background: transparent; border: 1px solid #ffffff2a; color: #cbd5e0; width: 100%; padding: 10px; border-radius: 8px; margin-top: 10px; cursor: pointer; }
.logout-btn:hover { background: #e53e3e; color: white; border-color: #e53e3e; }

/* ── Main Viewport ─────────────────────────────────────────── */
.main-viewport {
    flex: 1;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.stat-card.highlight { border-left: 4px solid #4a7c6a; }
.stat-card .label { color: #8898aa; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
.stat-card .value { font-size: 1.8rem; font-weight: 800; color: #1e2925; }

/* Content Body */
.content-body {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}
.table-header h2 { font-size: 1.4rem; font-weight: 700; }

.premium-table {
    width: 100%;
    border-collapse: collapse;
}

.premium-table th {
    text-align: left;
    color: #8898aa;
    font-size: 0.8rem;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
    text-transform: uppercase;
}

.premium-table td {
    padding: 20px 0;
    border-bottom: 1px solid #f8faf9;
    font-size: 0.95rem;
}

.bold { font-weight: 700; color: #1e2925; }
.thumb-round { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.tag { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.tag.role.admin { background: #1e2925; color: white; }

.status-dropdown {
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
}
.status-dropdown.pendiente { background: #fff7ed; color: #c2410c; }
.status-dropdown.atendido { background: #f0fdf4; color: #15803d; }
.status-dropdown.cancelado { background: #fef2f2; color: #b91c1c; }

/* ── Metrics Pane ──────────────────────────────────────────── */
.bars-container { display: flex; flex-direction: column; gap: 20px; }
.bar-row { display: grid; grid-template-columns: 180px 1fr; align-items: center; gap: 20px; }
.bar-label { font-weight: 600; font-size: 0.9rem; }
.bar-track { background: #f1f5f9; height: 12px; border-radius: 6px; overflow: hidden; }
.bar-fill { background: #4a7c6a; height: 100%; border-radius: 6px; position: relative; transition: width 1s; }
.bar-value { position: absolute; right: 10px; top: -20px; font-size: 0.75rem; color: #4a7c6a; font-weight: 700; }

/* ── Modal & Forms ───────────────────────────────────────── */
.modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-card { background: white; width: 500px; border-radius: 24px; padding: 40px; }
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.g-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 0.85rem; color: #64748b; }
.field input, .field select, .field textarea { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }

.btn-solid { background: #4a7c6a; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-ghost { background: transparent; border: none; color: #64748b; font-weight: 600; cursor: pointer; }
.btn-primary { background: #4a7c6a; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }

/* Animations */
.animator-slide-up { animation: slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 900px) {
    .sidebar { display: none; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
