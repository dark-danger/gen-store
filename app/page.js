"use client";

import { useState, useEffect } from 'react';
import { products as rawProducts } from '../data.js';

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [category, setCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const addToCart = (product) => {
        setCart(prev => [...prev, product]);
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const cartTotal = cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);

    const filteredProducts = category === 'All' 
        ? rawProducts.sort(() => Math.random() - 0.5) 
        : rawProducts.filter(p => p.category === category);

    // Limit initial display so the DOM doesn't get flooded in this lightweight viewer, or unlimit it since we're natively scrolling.
    const displayProducts = filteredProducts.slice(0, 48); // Show up to 48 at a time for aesthetic demo

    const categories = ['All', 'Sensors', 'Modules', 'Actuators', 'Projects'];

    return (
        <main>
            {/* Navbar */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="logo">Gen<span>Store</span></div>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#shop" className={category !== 'All' ? 'active' : ''}>Store</a></li>
                        <li><a href="#about">About</a></li>
                    </ul>
                    <button className="btn-icon" onClick={() => setCartOpen(true)} aria-label="Open cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                    </button>
                </div>
            </nav>

            {/* Cart Drawer */}
            <div className={`cart-drawer-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}></div>
            <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>Your Cart</h3>
                    <button className="close-cart" onClick={() => setCartOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
                    ) : (
                        cart.map((item, index) => (
                            <div className="cart-item" key={index}>
                                <div className="cart-item-img">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.name}</div>
                                    <div className="cart-item-price">${item.price}</div>
                                    <button className="cart-item-remove" onClick={() => removeFromCart(index)}>Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${cartTotal}</span>
                        </div>
                        <button className="btn btn-primary btn-block">Checkout</button>
                    </div>
                )}
            </div>

            {/* Hero */}
            <header className="hero" id="home">
                <div className="hero-content">
                    <div className="tagline">Next Generation Hardware</div>
                    <h1 className="hero-title">Beyond The <span className="text-gradient">Breadboard</span>.</h1>
                    <p className="hero-subtitle">Premium IoT modules, smart actuators, and full-scale hardware projects engineered for builders and creators.</p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => { document.getElementById('shop').scrollIntoView(); }}>Explore Catalog</button>
                        <button className="btn btn-secondary glass-panel">Documentation</button>
                    </div>
                    <div className="stats">
                        <div className="stat-item glass-panel"><span className="stat-number">50+</span><span className="stat-label">Sensors</span></div>
                        <div className="stat-item glass-panel"><span className="stat-number">20+</span><span className="stat-label">Actuators</span></div>
                        <div className="stat-item glass-panel"><span className="stat-number">20+</span><span className="stat-label">Projects</span></div>
                    </div>
                </div>
                <div className="hero-image-wrapper">
                    <div className="glow-ring"></div>
                    <div className="glow-ring delay"></div>
                    <img src="/hero.png" alt="Advanced IoT Components" className="hero-image float-anim" />
                </div>
            </header>

            {/* Store Section */}
            <section className="store-section" id="shop">
                <div className="section-header">
                    <h2>Ultimate <span className="text-gradient">Hardware</span></h2>
                    <p>Over 110 unique components and projects in stock.</p>
                </div>

                <div className="category-tabs">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setCategory(cat)} 
                            className={`tab-btn ${category === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="product-grid">
                    {displayProducts.map((product, i) => (
                        <div className="product-card glass-panel" key={`${product.id}-${i}`}>
                            <div className="card-image-wrapper">
                                {product.image === 'sensor' && <svg className="svg-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 8v12h16V8M2 13h20M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3H7Z"></path></svg>}
                                {product.image === 'module' && <svg className="svg-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1"></circle><circle cx="10" cy="12" r="1"></circle><circle cx="14" cy="12" r="1"></circle><circle cx="18" cy="12" r="1"></circle></svg>}
                                {product.image === 'actuator' && <svg className="svg-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="1" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="23"></line></svg>}
                                {product.image === 'project' && <svg className="svg-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline></svg>}
                            </div>
                            <div className="card-content">
                                <div className="card-tag">{product.category}</div>
                                <h3>{product.name}</h3>
                                <div className="card-footer">
                                    <span className="price">${product.price}</span>
                                    <button className="btn-icon add-to-cart" onClick={() => addToCart(product)} aria-label="Add to cart">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-6.2-4h6.4a2 2 0 0 0 1.9-1.4l2.4-8.6H5.4M3 4h2l1 5h13m-2.2 7H7.6L6 5H3"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
