"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, profile, signOut } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);
    
    // Form state
    const [form, setForm] = useState({
        name: '',
        category: 'Sensors',
        price: '',
        image: '',
        details: ''
    });

    const categories = ['All', 'Sensors', 'Modules', 'Actuators', 'Projects', 'Circuits'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showNotification('Error loading products: ' + error.message, 'error');
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const resetForm = () => {
        setForm({ name: '', category: 'Sensors', price: '', image: '', details: '' });
        setEditProduct(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (product) => {
        setForm({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            image: product.image,
            details: product.details
        });
        setEditProduct(product);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name || !form.price || !form.category) {
            showNotification('Please fill all required fields.', 'error');
            return;
        }

        const productData = {
            name: form.name,
            category: form.category,
            price: parseInt(form.price),
            image: form.image || 'https://placehold.co/400x300/111/00ff88?text=' + encodeURIComponent(form.name),
            details: form.details || `High quality ${form.name} for your next build.`
        };

        if (editProduct) {
            // Update
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editProduct.id);

            if (error) {
                showNotification('Error updating: ' + error.message, 'error');
            } else {
                showNotification(`"${form.name}" updated successfully!`);
                closeModal();
                fetchProducts();
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) {
                showNotification('Error adding: ' + error.message, 'error');
            } else {
                showNotification(`"${form.name}" added to store!`);
                closeModal();
                fetchProducts();
            }
        }
    };

    const handleDelete = async (product) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);

        if (error) {
            showNotification('Error deleting: ' + error.message, 'error');
        } else {
            showNotification(`"${product.name}" removed from store.`);
            setDeleteConfirm(null);
            fetchProducts();
        }
    };

    // Filter products
    const filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.details?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const stats = {
        total: products.length,
        sensors: products.filter(p => p.category === 'Sensors').length,
        modules: products.filter(p => p.category === 'Modules').length,
        actuators: products.filter(p => p.category === 'Actuators').length,
        projects: products.filter(p => p.category === 'Projects').length,
        circuits: products.filter(p => p.category === 'Circuits').length,
    };

    return (
        <main className="admin-page">
            {/* Notification Toast */}
            {notification && (
                <div className={`admin-toast ${notification.type}`}>
                    <span>{notification.type === 'success' ? '✓' : '✕'}</span>
                    {notification.message}
                </div>
            )}

            {/* Admin Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-top">
                    <Link href="/" className="admin-brand">
                        Gen<span>Store</span>
                    </Link>
                    <div className="admin-badge">ADMIN</div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-label">Dashboard</div>
                    <button className="admin-nav-item active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Products
                    </button>

                    <div className="admin-nav-label" style={{marginTop: '24px'}}>Categories</div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`admin-nav-item ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                            <span className="admin-nav-count">
                                {cat === 'All' ? stats.total : stats[cat.toLowerCase()] || 0}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {profile?.full_name?.[0] || user?.email?.[0] || 'A'}
                        </div>
                        <div className="admin-user-details">
                            <div className="admin-user-name">{profile?.full_name || 'Admin'}</div>
                            <div className="admin-user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button className="admin-logout" onClick={signOut}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div>
                        <h1>Product Management</h1>
                        <p>Manage your sensor modules, actuators & more</p>
                    </div>
                    <div className="admin-topbar-actions">
                        <div className="admin-search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary admin-add-btn" onClick={openAddModal}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Product
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon sensors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                        <div>
                            <div className="admin-stat-number">{stats.sensors}</div>
                            <div className="admin-stat-label">Sensors</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon modules">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3M1 9h3m16 6h3M1 15h3"/></svg>
                        </div>
                        <div>
                            <div className="admin-stat-number">{stats.modules}</div>
                            <div className="admin-stat-label">Modules</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon actuators">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <div>
                            <div className="admin-stat-number">{stats.actuators}</div>
                            <div className="admin-stat-label">Actuators</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon projects">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div>
                            <div className="admin-stat-number">{stats.projects + stats.circuits}</div>
                            <div className="admin-stat-label">Projects & Circuits</div>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="admin-table-container glass-panel">
                    <div className="admin-table-header">
                        <h3>
                            {activeCategory === 'All' ? 'All Products' : activeCategory}
                            <span className="admin-table-count">{filtered.length} items</span>
                        </h3>
                    </div>

                    {loading ? (
                        <div className="admin-table-loading">
                            <div className="admin-loading-spinner"></div>
                            Loading products...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="admin-table-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            <p>No products found. Add your first product!</p>
                        </div>
                    ) : (
                        <div className="admin-table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="admin-product-cell">
                                                    <div className="admin-product-thumb">
                                                        <img src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://placehold.co/60x60/111/00ff88?text=?'; }} />
                                                    </div>
                                                    <div>
                                                        <div className="admin-product-name">{product.name}</div>
                                                        <div className="admin-product-desc">{product.details?.substring(0, 60)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`admin-category-badge ${product.category?.toLowerCase()}`}>
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="admin-price">₹{product.price}</td>
                                            <td>
                                                <div className="admin-actions">
                                                    <button className="admin-action-btn edit" onClick={() => openEditModal(product)} title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </button>
                                                    <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(product)} title="Delete">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="admin-modal glass-panel">
                        <div className="admin-modal-header">
                            <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="admin-modal-close" onClick={closeModal}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-form">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Product Name *</label>
                                    <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Ultrasonic Sensor Pro" required />
                                </div>
                                <div className="admin-form-group">
                                    <label>Category *</label>
                                    <select name="category" value={form.category} onChange={handleFormChange} required>
                                        <option value="Sensors">Sensors</option>
                                        <option value="Modules">Modules</option>
                                        <option value="Actuators">Actuators</option>
                                        <option value="Projects">Projects</option>
                                        <option value="Circuits">Circuits</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Price (₹) *</label>
                                    <input type="number" name="price" value={form.price} onChange={handleFormChange} placeholder="599" min="1" required />
                                </div>
                                <div className="admin-form-group">
                                    <label>Image URL</label>
                                    <input type="url" name="image" value={form.image} onChange={handleFormChange} placeholder="https://example.com/image.jpg" />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea name="details" value={form.details} onChange={handleFormChange} placeholder="Detailed description of the product..." rows={3}></textarea>
                            </div>

                            {form.image && (
                                <div className="admin-image-preview">
                                    <img src={form.image} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}

                            <div className="admin-modal-actions">
                                <button type="button" className="btn admin-btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
                    <div className="admin-delete-modal glass-panel">
                        <div className="admin-delete-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <h3>Delete Product?</h3>
                        <p>Are you sure you want to remove <strong>&quot;{deleteConfirm.name}&quot;</strong>? This action cannot be undone.</p>
                        <div className="admin-delete-actions">
                            <button className="btn admin-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn admin-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
