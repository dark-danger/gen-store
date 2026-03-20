"use client";

import { useState, useEffect } from 'react';
import { products as rawProducts } from '../data.js';
import { supabase } from './lib/supabase';
import { useAuth } from './components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const { user, profile, signOut, isAdmin, loading: authLoading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [category, setCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [products, setProducts] = useState(rawProducts);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Checkout Modal State
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutProduct, setCheckoutProduct] = useState(null);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', address: '', pincode: '', quantity: 1 });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [authLoading, user, router]);

    // Fetch from Supabase (fallback to local data)
    useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                setProducts(data);
            }
        }
        fetchProducts();
    }, []);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="auth-loading-screen">
                <div className="auth-loading-spinner-lg"></div>
                <p>Loading GenStore...</p>
            </div>
        );
    }

    // Don't render anything if not logged in (will redirect)
    if (!user) {
        return (
            <div className="auth-loading-screen">
                <div className="auth-loading-spinner-lg"></div>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    const addToCart = (product) => {
        setCart(prev => [...prev, product]);
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + parseInt(item.price), 0);
    };

    const openCheckout = (product = null) => {
        if (product) {
            setCheckoutProduct(product);
            setCheckoutForm({ ...checkoutForm, quantity: 1 });
        } else {
            setCheckoutProduct(null);
        }
        setCheckoutOpen(true);
        setCartOpen(false);
    };

    const closeCheckout = () => {
        setCheckoutOpen(false);
        setCheckoutProduct(null);
    };

    const handleFormChange = (e) => {
        setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
    };

    let checkoutTotalAmount = 0;
    if (checkoutProduct) {
        checkoutTotalAmount = checkoutProduct.price * Math.max(1, checkoutForm.quantity);
    } else {
        checkoutTotalAmount = getCartTotal();
    }

    const filteredProducts = category === 'All' 
        ? products 
        : products.filter(p => p.category === category);
    const displayProducts = filteredProducts.slice(0, 48);

    const categories = ['All', 'Sensors', 'Modules', 'Actuators', 'Projects', 'Circuits'];

    const upiLink = `upi://pay?pa=khannayash398-1@okicici&pn=GenBots&am=${checkoutTotalAmount}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}&bgcolor=111111&color=00ff88`;

    return (
        <main>
            {/* Navbar */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="logo">Gen<span>Store</span></div>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#shop" onClick={() => setCategory('Sensors')} className={category === 'Sensors' ? 'active' : ''}>Sensors</a></li>
                        <li><a href="#shop" onClick={() => setCategory('Modules')} className={category === 'Modules' ? 'active' : ''}>Modules</a></li>
                        <li><a href="#shop" onClick={() => setCategory('Projects')} className={category === 'Projects' ? 'active' : ''}>Projects</a></li>
                        <li><a href="#shop" onClick={() => setCategory('Circuits')} className={category === 'Circuits' ? 'active' : ''}>Circuits</a></li>
                    </ul>
                    <div className="nav-actions">
                        <a href="http://thegenbots.in" target="_blank" rel="noopener noreferrer" className="btn-nav-genbots">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            GenBots
                        </a>
                        <button className="btn-icon" onClick={() => setCartOpen(true)} aria-label="Open cart">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                        </button>

                        {/* User Menu */}
                        <div className="user-menu-wrapper">
                            <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                <div className="user-avatar-circle">
                                    {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                                </div>
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className="user-menu-backdrop" onClick={() => setUserMenuOpen(false)}></div>
                                    <div className="user-dropdown">
                                        <div className="user-dropdown-header">
                                            <div className="user-dropdown-name">{profile?.full_name || 'User'}</div>
                                            <div className="user-dropdown-email">{user.email}</div>
                                        </div>
                                        {isAdmin && (
                                            <Link href="/admin" className="user-dropdown-item admin-link" onClick={() => setUserMenuOpen(false)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button className="user-dropdown-item logout-item" onClick={() => { signOut(); setUserMenuOpen(false); }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
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
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.name}</div>
                                    <div className="cart-item-price">₹{item.price}</div>
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
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={() => openCheckout(null)}>Secure Checkout</button>
                    </div>
                )}
            </div>

            {/* Checkout Modal */}
            {checkoutOpen && (
                <div className="checkout-overlay">
                    <div className="checkout-modal">
                        <button className="checkout-close" onClick={closeCheckout}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        
                        <div className="checkout-content">
                            <div className="checkout-left">
                                <h2>Order Summary</h2>
                                {checkoutProduct ? (
                                    <div className="checkout-product-preview">
                                        <img src={checkoutProduct.image} alt={checkoutProduct.name} />
                                        <div className="checkout-product-info">
                                            <h3>{checkoutProduct.name}</h3>
                                            <p>{checkoutProduct.details}</p>
                                            <div className="ch-price">₹{checkoutProduct.price} / unit</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="checkout-cart-preview">
                                        <p>{cart.length} items in cart</p>
                                        <div className="cart-preview-list">
                                            {cart.slice(0, 3).map((item, i) => (
                                                <div className="cp-item" key={i}>
                                                    <span>{item.name}</span>
                                                    <span>₹{item.price}</span>
                                                </div>
                                            ))}
                                            {cart.length > 3 && <div className="cp-item">...and {cart.length - 3} more</div>}
                                        </div>
                                    </div>
                                )}

                                <div className="checkout-form">
                                    <h3>Delivery Details</h3>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="name" placeholder="Yash Khanna" onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Full Address</label>
                                        <textarea name="address" placeholder="123 Hardware Lane, Sector 4..." onChange={handleFormChange}></textarea>
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <input type="text" name="pincode" placeholder="131001" onChange={handleFormChange} />
                                        </div>
                                        {checkoutProduct && (
                                            <div className="form-group">
                                                <label>Quantity</label>
                                                <input type="number" name="quantity" min="1" value={checkoutForm.quantity} onChange={handleFormChange} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-right">
                                <div className="payment-panel">
                                    <h3>Total Secure Payment</h3>
                                    <div className="payment-amount">₹{checkoutTotalAmount}</div>
                                    <div className="qr-container">
                                        <img src={qrCodeUrl} alt="UPI Payment QR Code" />
                                    </div>
                                    <p className="qr-instruction">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                                    <div className="upi-id-badge">khannayash398-1@okicici</div>
                                    <button className="btn btn-primary btn-block" style={{marginTop: '20px'}}>I have paid</button>
                                </div>
                                <div className="suggestions">
                                    <h4>Usually Bought Together</h4>
                                    <div className="suggestion-item">
                                        <span>Jumper Wires (40pcs)</span>
                                        <span>+₹120</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span>Breadboard Full</span>
                                        <span>+₹180</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="stat-item glass-panel"><span className="stat-number">50+</span><span className="stat-label">Circuits</span></div>
                        <div className="stat-item glass-panel"><span className="stat-number">40+</span><span className="stat-label">Actuators/Modules</span></div>
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
                        <button key={cat} onClick={() => setCategory(cat)} className={`tab-btn ${category === cat ? 'active' : ''}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="product-grid">
                    {displayProducts.map((product) => (
                        <div className="product-card glass-panel" key={product.id}>
                            <div className="card-image-wrapper">
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="card-content">
                                <div className="card-tag">{product.category}</div>
                                <h3>{product.name}</h3>
                                <p className="card-desc">{product.details}</p>
                                <div className="card-footer">
                                    <span className="price">₹{product.price}</span>
                                    <div className="card-actions">
                                        <button className="btn-icon add-to-cart-icon" onClick={() => addToCart(product)} aria-label="Add to cart">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-6.2-4h6.4a2 2 0 0 0 1.9-1.4l2.4-8.6H5.4M3 4h2l1 5h13m-2.2 7H7.6L6 5H3"/></svg>
                                        </button>
                                        <button className="btn-buy-now" onClick={() => openCheckout(product)}>Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-genbots">
                <div className="footer-gb-content">
                    <div className="gb-brand">
                        <div className="gb-logo">
                            <span className="gb-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M12 8v8M8 12h8"></path></svg>
                            </span>
                            GenBots
                        </div>
                        <p>Empowering the next generation with hands-on STEM education through IoT, robotics, and AI-integrated learning experiences.</p>
                        <div className="gb-social">
                            <a href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
                            <a href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"></path></svg></a>
                            <a href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
                        </div>
                    </div>
                    <div className="gb-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Programs</a></li>
                            <li><a href="#">Projects</a></li>
                            <li><a href="#">Why GenBots</a></li>
                        </ul>
                    </div>
                    <div className="gb-links">
                        <h4>Programs</h4>
                        <ul>
                            <li><a href="#">IoT &amp; Smart Home</a></li>
                            <li><a href="#">Robotics</a></li>
                            <li><a href="#">Drone Engineering</a></li>
                            <li><a href="#">Python Programming</a></li>
                            <li><a href="#">AI-IoT Systems</a></li>
                        </ul>
                    </div>
                    <div className="gb-contact">
                        <h4>Contact</h4>
                        <ul>
                            <li>
                                <span className="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg></span>
                                khannayash394@gmail.com
                            </li>
                            <li>
                                <span className="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                                +91 92110 67540
                            </li>
                            <li>
                                <span className="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
                                Sonipat, Haryana, India
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="gb-bottom">
                    <p>© 2026 GenBots. All rights reserved.</p>
                    <div className="gb-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
