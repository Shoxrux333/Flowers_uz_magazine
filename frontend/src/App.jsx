import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Check, Trash2, LogOut, User } from 'lucide-react';

// Production uchun backend URL'ni bu yerda o'zgartiring
const API_BASE = 'http://localhost:5000'; // Development
// const API_BASE = 'https://flowers-uz-backend.onrender.com'; // Production

const FlowersUZ = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: ''
  });

  // Token'ni tekshirish va foydalanuvchi ma'lumotlarini yuklash
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  // Foydalanuvchi ma'lumotlarini olish
  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        sessionStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('User fetch error:', error);
    }
  };

  const products = [
    {
      id: 1,
      name: 'Neon Roses',
      description: 'Hot pink, ultra-luxe glow',
      price: 150000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/f0887af2-c11b-41e4-b7a7-255b2ef7e6b8.avif'
    },
    {
      id: 2,
      name: 'Cyan Lilies',
      description: 'Bold lilies, electric energy',
      price: 120000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/62168c6d-f4e9-43fb-8477-4513b4a99250.avif'
    },
    {
      id: 3,
      name: 'Purple Peonies',
      description: 'Soft petals, neon shine',
      price: 180000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/b996cbf4-9567-4277-9b8c-0fb13a3e97a5.avif'
    },
    {
      id: 4,
      name: 'Golden Tulips',
      description: 'Elegant blooms with golden glow',
      price: 100000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/b8357217-83e5-4c26-a1f2-16af6772385a.avif'
    },
    {
      id: 5,
      name: 'Orchid Paradise',
      description: 'Exotic flowers, neon magic',
      price: 200000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/323f3d81-3c41-493d-a76b-57871fa6e4c8.avif'
    },
    {
      id: 6,
      name: 'Rainbow Mix',
      description: 'Vibrant colors, pure joy',
      price: 160000,
      image: 'https://cdn.prod.website-files.com/image-generation-assets/282fa2ba-089f-42a5-b412-3995d1256801.avif'
    }
  ];

  // Google OAuth kirish
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  // Email/Password ro'yxatdan o'tish
  const handleRegister = async () => {
    if (!loginForm.email || !loginForm.password || !loginForm.name) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setShowLogin(false);
        setLoginForm({ email: '', password: '', name: '' });
      } else {
        alert(data.error || 'Ro\'yxatdan o\'tishda xatolik');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Server bilan bog\'lanishda xatolik');
    }
    setLoading(false);
  };

  // Email/Password kirish
  const handleEmailLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Email va parol kiriting!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setShowLogin(false);
        setLoginForm({ email: '', password: '', name: '' });
      } else {
        alert(data.error || 'Kirishda xatolik');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server bilan bog\'lanishda xatolik');
    }
    setLoading(false);
  };

  // Chiqish
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('auth_token');
    setCart([]);
  };

  const addToCart = (product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // To'lovni amalga oshirish
  const processPayment = async () => {
    if (!orderData.name || !orderData.phone || !orderData.address) {
      alert('Iltimos barcha maydonlarni to\'ldiring!');
      return;
    }

    if (orderData.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Karta raqami noto\'g\'ri!');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      
      const encryptedOrder = {
        items: cart.map(item => ({
          productId: item.id,
          productName: btoa(item.name),
          quantity: item.quantity,
          price: item.price
        })),
        customer: {
          name: btoa(orderData.name),
          phone: btoa(orderData.phone),
          address: btoa(orderData.address)
        },
        total: getTotalPrice(),
        paymentMethod: 'card'
      };

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(encryptedOrder)
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentSuccess(true);
        setCart([]);
        setShowCheckout(false);
        setOrderData({ name: '', phone: '', address: '', cardNumber: '', cardExpiry: '', cardCVV: '' });
        
        setTimeout(() => {
          setPaymentSuccess(false);
        }, 3000);
      } else {
        alert(data.error || 'To\'lovda xatolik');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('To\'lovda xatolik yuz berdi');
    }
    setLoading(false);
  };

  // Agar kirish bo'lmasa - Login sahifasi
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-3xl font-bold">F</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">flowers_uz</h1>
            <p className="text-gray-600">Luxury blooms with neon vibes</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google orqali kirish</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">yoki</span>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold mb-2">Ismingiz</label>
                <input 
                  type="text"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  placeholder="Ism Familiya"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input 
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Parol</label>
              <input 
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={isRegister ? handleRegister : handleEmailLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Kuting...' : (isRegister ? 'Ro\'yxatdan o\'tish' : 'Kirish')}
            </button>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-pink-600 hover:text-pink-700 transition text-sm"
            >
              {isRegister ? 'Allaqachon akkauntingiz bormi? Kirish' : 'Akkauntingiz yo\'qmi? Ro\'yxatdan o\'ting'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Asosiy sahifa
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl font-bold">F</div>
              </div>
              <span className="text-xl font-bold text-gray-900">flowers_uz</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#shop" className="text-gray-700 hover:text-pink-600 transition">Shop</a>
              <a href="#about" className="text-gray-700 hover:text-pink-600 transition">About</a>
              <a href="#gallery" className="text-gray-700 hover:text-pink-600 transition">Gallery</a>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{user.name || user.email}</span>
                </div>
                
                <button 
                  onClick={() => setShowCart(true)}
                  className="relative bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition flex items-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition p-2"
                  title="Chiqish"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 pb-3 border-b">
                <User size={16} />
                <span>{user.name || user.email}</span>
              </div>
              <a href="#shop" className="block text-gray-700 hover:text-pink-600">Shop</a>
              <a href="#about" className="block text-gray-700 hover:text-pink-600">About</a>
              <a href="#gallery" className="block text-gray-700 hover:text-pink-600">Gallery</a>
              <button 
                onClick={() => { setShowCart(true); setMobileMenuOpen(false); }}
                className="w-full bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-700 transition py-2 text-center border-t pt-3"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}
      </nav>

      <header className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-sm text-pink-600 font-semibold mb-4">Luxury blooms, neon vibes</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Flowers reimagined. Shop the future.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Step into a world of glowing bouquets, premium petals, and next-level style. 
            Discover the freshest flowers with a modern twist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#shop" className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition font-semibold">
              Shop now
            </a>
            <a href="#gallery" className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition font-semibold">
              View gallery
            </a>
          </div>
        </div>
      </header>

      <section id="shop" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Gallery in full bloom</h2>
            <p className="text-gray-600">Dive into our neon bouquet showcase</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-600">
                      {(product.price / 1000).toFixed(0)}K so'm
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition font-semibold"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why our bouquets stand out</h2>
            <p className="text-gray-600">Discover what makes our flowers pop</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Handpicked, always fresh', desc: 'Every bouquet crafted with premium blooms, sourced daily for vibrant color.' },
              { title: 'Neon-wrapped for wow factor', desc: 'Signature neon wraps and glowing accents turn every bouquet into a show-stopper.' },
              { title: 'Fast delivery, all hours', desc: 'Speedy couriers deliver your flowers with care, day or night, citywide.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Check className="text-pink-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button onClick={() => setShowCart(false)}>
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Savat bo'sh</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-pink-600 font-bold">{(item.price / 1000).toFixed(0)}K so'm</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-semibold">Jami:</span>
                    <span className="text-2xl font-bold text-pink-600">
                      {(getTotalPrice() / 1000).toFixed(0)}K so'm
                    </span>
                  </div>
                  <button 
                    onClick={() => { setShowCheckout(true); setShowCart(false); }}
                    className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
                  >
                    To'lovga o'tish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">To'lov ma'lumotlari</h2>
              <button onClick={() => setShowCheckout(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input type="text" value={orderData.name} onChange={(e) => setOrderData({...orderData, name: e.target.value})} className="w-full border rounded-lg px-4 py-2" placeholder="Ismingiz" />
              <input type="tel" value={orderData.phone} onChange={(e) => setOrderData({...orderData, phone: e.target.value})} className="w-full border rounded-lg px-4 py-2" placeholder="+998 90 123 45 67" />
              <textarea value={orderData.address} onChange={(e) => setOrderData({...orderData, address: e.target.value})} className="w-full border rounded-lg px-4 py-2" placeholder="Manzil" rows="2" />
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Karta ma'lumotlari</h3>
                <input type="text" value={orderData.cardNumber} onChange={(e) => setOrderData({...orderData, cardNumber: e.target.value.replace(/\s/g,'').replace(/(\d{4})/g,'$1 ').trim()})} className="w-full border rounded-lg px-4 py-2 mb-3" placeholder="1234 5678 9012 3456" maxLength="19" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={orderData.cardExpiry} onChange={(e) => {let v=e.target.value.replace(/\D/g,''); if(v.length>=2) v=v.slice(0,2)+'/'+v.slice(2,4); setOrderData({...orderData,cardExpiry:v})}} className="w-full border rounded-lg px-4 py-2" placeholder="MM/YY" maxLength="5" />
                  <input type="text" value={orderData.cardCVV} onChange={(e) => setOrderData({...orderData,cardCVV:e.target.value.replace(/\D/g,'')})} className="w-full border rounded-lg px-4 py-2" placeholder="CVV" maxLength="3" />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Jami:</span>
                  <span className="text-2xl font-bold text-pink-600">{(getTotalPrice()/1000).toFixed(0)}K so'm</span>
                </div>
                <button onClick={processPayment} disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition font-semibold disabled:opacity-50">
                  {loading ? 'Kuting...' : 'To\'lovni amalga oshirish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">To'lov muvaffaqiyatli!</h2>
            <p className="text-gray-600 mb-4">Buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.</p>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-xl font-bold">F</div>
                </div>
                <span className="text-xl font-bold">flowers_uz</span>
              </div>
              <p className="text-gray-400">Luxury blooms with neon vibes</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-pink-400 transition">Bouquets</a></li>
                <li><a href="#" className="hover:text-pink-400 transition">Gifts</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-pink-400 transition">FAQ</a></li>
                <li><a href="#" className="hover:text-pink-400 transition">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+998 90 123 45 67</li>
                <li>info@flowers-uz.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 flowers_uz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlowersUZ;
