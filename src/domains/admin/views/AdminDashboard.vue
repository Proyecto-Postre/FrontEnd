<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const products = ref([]);
const users = ref([]);
const activeTab = ref('products'); // 'products' | 'users'
const isEditing = ref(false);
const currentProduct = ref({});
const fileName = ref('');

const emptyProduct = {
    title: '',
    price: '',
    description: '',
    category: 'Tortas', // default
    image: '',
    popular: false
};

// Fetch data
const fetchProducts = async () => {
    try {
        const res = await fetch('/api/products');
        products.value = await res.json();
    } catch (e) {
        console.error("Error fetching products:", e);
    }
};

const fetchUsers = async () => {
    try {
        const res = await fetch('/api/users');
        users.value = await res.json();
    } catch (e) {
        console.error("Error fetching users:", e);
    }
};

onMounted(() => {
    fetchProducts();
    fetchUsers();
});

// Form Actions
const openAddModal = () => {
    currentProduct.value = { ...emptyProduct };
    isEditing.value = true;
};

const editProduct = (product) => {
    currentProduct.value = { ...product };
    isEditing.value = true;
};

const currentUser = ref({});

const closeMode = () => {
    isEditing.value = false;
    currentProduct.value = {};
};

// ... CRUD Operations for Products ...

// User Management
const deleteUser = async (id) => {
    if (id === currentUser.value.id) {
        alert(t('admin.alerts.delete_self'));
        return;
    }
    if (!confirm(t('admin.alerts.confirm_delete_user'))) return;

    try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        await fetchUsers(); // Refresh list
    } catch (e) {
        alert(t('admin.alerts.error_delete_user'));
    }
};



// CRUD Operations
const saveProduct = async () => {
    const isNew = !currentProduct.value.id;
    const url = isNew ? '/api/products' : `/api/products/${currentProduct.value.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    // Ensure clean price formatting
    if (!currentProduct.value.price.startsWith('S/ ')) {
        // If user just typed "30", format it. If they typed "S/ 30", leave it.
        // Simple check, sophisticated regex can be better but this works for simple Admin usage.
        const cleanVal = currentProduct.value.price.replace(/[^0-9.]/g, '');
        currentProduct.value.price = `S/ ${parseFloat(cleanVal).toFixed(2)}`;
    }

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentProduct.value)
        });
        
        await fetchProducts(); // Refresh list
        closeMode();
        alert(isNew ? t('admin.alerts.success_add') : t('admin.alerts.success_update'));
    } catch (e) {
        alert(t('admin.alerts.error_save'));
    }
};

const deleteProduct = async (id) => {
    if (!confirm(t('admin.alerts.confirm_delete_product'))) return;

    try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        await fetchProducts();
    } catch (e) {
        alert(t('admin.alerts.error_delete_product'));
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        fileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentProduct.value.image = e.target.result; // Base64 string
        };
        reader.readAsDataURL(file);
    }
};
</script>

<template>
    <div class="admin-dashboard container">
        <div class="dashboard-header">
            <h1>{{ t('admin.title') }}</h1>
            <p>{{ t('admin.subtitle') }}</p>
        </div>

        <!-- TABS NAVIGATION -->
        <div class="tabs-nav">
            <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'products' }"
                @click="activeTab = 'products'"
            >
                {{ t('admin.tab_inventory') }}
            </button>
            <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
            >
                {{ t('admin.tab_users') }}
            </button>
        </div>

        <!-- PRODUCTS TAB -->
        <div v-if="activeTab === 'products'">
            <div class="actions-bar">
                <button class="btn-primary" @click="openAddModal">
                    {{ t('admin.btn_add') }}
                </button>
            </div>

            <div class="table-responsive">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>{{ t('admin.table.image') }}</th>
                            <th>{{ t('admin.table.name') }}</th>
                            <th>{{ t('admin.table.category') }}</th>
                            <th>{{ t('admin.table.price') }}</th>
                            <th>{{ t('admin.table.description') }}</th>
                            <th>{{ t('admin.table.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in products" :key="product.id">
                            <td>
                                <img :src="product.image || '/assets/ejemplo.avif'" class="thumb" />
                            </td>
                            <td>{{ product.title }}</td>
                            <td>
                                <span class="badge" :class="product.category">{{ product.category }}</span>
                            </td>
                            <td>{{ product.price }}</td>
                            <td class="desc-cell">{{ product.description }}</td>
                            <td class="actions-cell">
                                <button @click="editProduct(product)" class="btn-icon edit" :title="t('admin.actions.edit')">✏️</button>
                                <button @click="deleteProduct(product.id)" class="btn-icon delete" :title="t('admin.actions.delete')">🗑️</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- USERS TAB -->
        <div v-if="activeTab === 'users'" class="users-section">
            <div class="table-responsive">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>{{ t('admin.table.name') }}</th>
                            <th>{{ t('admin.table.lastname') }}</th>
                            <th>{{ t('admin.table.email') }}</th>
                            <th>{{ t('admin.table.phone') }}</th>
                            <th>{{ t('admin.table.role') }}</th>
                            <th>{{ t('admin.table.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.name }}</td>
                            <td>{{ user.lastname || user.lastName }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.phone }}</td>
                            <td>
                                <span class="badge" :class="user.role === 'admin' ? 'admin-role' : 'user-role'">
                                    {{ user.role || 'user' }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button 
                                    v-if="user.id !== currentUser.id"
                                    @click="deleteUser(user.id)" 
                                    class="btn-icon delete" 
                                    :title="t('admin.actions.delete_user')"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal / Form Overlay -->
        <div v-if="isEditing" class="modal-overlay">
            <div class="modal-content">
                <h2>{{ currentProduct.id ? t('admin.form.edit_title') : t('admin.form.new_title') }}</h2>
                
                <form @submit.prevent="saveProduct" class="product-form">
                    <div class="form-group">
                        <label>{{ t('admin.form.product_name') }}</label>
                        <input v-model="currentProduct.title" required placeholder="Ej: Torta de Chocolate" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>{{ t('admin.form.price') }}</label>
                            <input v-model="currentProduct.price" required placeholder="0.00" />
                        </div>
                        <div class="form-group">
                            <label>{{ t('admin.form.category') }}</label>
                            <select v-model="currentProduct.category">
                                <option value="Tortas">Tortas</option>
                                <option value="Postres">Postres</option>
                                <option value="Bebidas">Bebidas</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>{{ t('admin.form.image_label') }}</label>
                        <div class="file-upload-container">
                            <label for="file-upload" class="custom-file-upload">
                                {{ t('admin.form.select_image') }}
                            </label>
                            <input id="file-upload" type="file" @change="handleFileUpload" accept="image/*" />
                            <span v-if="fileName" class="file-name">{{ fileName }}</span>
                            <span v-else class="file-name placeholder">{{ t('admin.form.no_file') }}</span>
                        </div>
                        
                        <div v-if="currentProduct.image" class="image-preview">
                            <img :src="currentProduct.image" alt="Vista previa" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>{{ t('admin.form.description') }}</label>
                        <textarea v-model="currentProduct.description" rows="3"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" @click="closeMode">{{ t('admin.form.cancel') }}</button>
                        <button type="submit" class="btn-save">{{ t('admin.form.save') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-dashboard {
    padding: 60px 20px;
    min-height: 80vh;
}

.dashboard-header {
    text-align: center;
    margin-bottom: 40px;
}

.dashboard-header h1 {
    font-family: var(--heading-font-family);
    color: var(--text-color);
}

.actions-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
}

.products-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    border-radius: 10px;
    overflow: hidden;
}

.products-table th, .products-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.products-table th {
    background: #f4f4f4;
    font-weight: 700;
}

.thumb {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 5px;
}

.desc-cell {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #777;
    font-size: 0.9rem;
}

.badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: capitalize;
}

.tabs-nav {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
}

.tab-btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
    color: #888;
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
}

.tab-btn.active {
    color: var(--primary-color);
    border-bottom: 3px solid var(--primary-color);
}

.tab-btn:hover {
    color: var(--primary-color);
}

.badge.Tortas { background: #ffe0e0; color: #d64545; }
.badge.Postres { background: #e0f0ff; color: #007bff; }
.badge.Bebidas { background: #e0ffe0; color: #28a745; }

.badge.admin-role { background: #333; color: #fff; }
.badge.user-role { background: #eee; color: #666; }

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
    transition: transform 0.2s;
}

.btn-icon:hover {
    transform: scale(1.2);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: var(--text-color);
}

.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.btn-save {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-cancel {
    background: #eee;
    color: #666;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.image-preview {
    margin-top: 10px;
    text-align: center;
}

.image-preview img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 10px;
    border: 2px solid #eee;
}

/* Custom File Upload */
.file-upload-container {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

input[type="file"] {
    display: none;
}

.custom-file-upload {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 10px 20px;
    cursor: pointer;
    background: #f9f9f9;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s;
    color: #555;
    white-space: nowrap;
}

.custom-file-upload:hover {
    background: #eee;
    border-color: #999;
}

.file-name {
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.file-name.placeholder {
    color: #aaa;
}
</style>
