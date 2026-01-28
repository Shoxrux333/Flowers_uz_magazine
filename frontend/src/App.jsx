import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Check, Trash2, LogOut, User } from 'lucide-react';

// Production uchun backend URL'ni bu yerda o'zgartiring
const API_BASE = 'https://flowers-backend-0e8s.onrender.com'; // Production
// const API_BASE = 'http://localhost:5000'; // Development

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
                <span>Cart</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <LogOut size={20} />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <div className="relative bg-gray-900 py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://cdn.prod.website-files.com/image-generation-assets/f0887af2-c11b-41e4-b7a7-255b2ef7e6b8.avif" 
              alt="Hero background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Luxury <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Neon</span> Blooms
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Experience the future of floral design. Hand-crafted arrangements with an electric glow.
            </p>
            <a 
              href="#shop"
              className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-pink-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
            >
              Shop Collection
            </a>
          </div>
        </div>

        {/* Products Grid */}
        <div id="shop" className="max-w-7xl mx-auto px-4 py-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Collection</h2>
              <p className="text-gray-600 mt-2">Choose your perfect neon arrangement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition duration-300">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <span className="text-pink-600 font-bold">{product.price.toLocaleString()} UZS</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{product.description}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition duration-300 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCart(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="px-6 py-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <p className="text-gray-500 text-sm">{item.price.toLocaleString()} UZS</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">-</button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-6 py-8 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span>{getTotalPrice().toLocaleString()} UZS</span>
                  </div>
                  <button 
                    onClick={() => { setShowCart(false); setShowCheckout(true); }}
                    className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition shadow-lg"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCheckout(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Information</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input 
                    type="text"
                    value={orderData.name}
                    onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Delivery Address</label>
                  <textarea 
                    value={orderData.address}
                    onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    rows="3"
                    placeholder="Tashkent, Chilanzar district..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                <div className="bg-gray-900 rounded-xl p-6 text-white mb-6">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-8 bg-yellow-500 rounded-md opacity-80"></div>
                    <div className="text-xl font-bold italic">VISA</div>
                  </div>
                  <div className="text-xl tracking-widest mb-4">
                    {orderData.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between text-sm opacity-70">
                    <span>CARD HOLDER</span>
                    <span>EXPIRES</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{orderData.name.toUpperCase() || 'YOUR NAME'}</span>
                    <span>{orderData.cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Card Number</label>
                  <input 
                    type="text"
                    value={orderData.cardNumber}
                    onChange={(e) => setOrderData({...orderData, cardNumber: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                    <input 
                      type="text"
                      value={orderData.cardExpiry}
                      onChange={(e) => setOrderData({...orderData, cardExpiry: e.target.value})}
                      className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">CVV</label>
                    <input 
                      type="password"
                      value={orderData.cardCVV}
                      onChange={(e) => setOrderData({...orderData, cardCVV: e.target.value})}
                      className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="•••"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex justify-between text-2xl font-bold text-gray-900 mb-8">
                <span>Total Amount</span>
                <span>{getTotalPrice().toLocaleString()} UZS</span>
              </div>
              <button 
                onClick={processPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-pink-700 hover:to-purple-700 transition shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {paymentSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 animate-bounce">
          <Check size={24} />
          <span className="font-bold text-lg">Order placed successfully!</span>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl font-bold">F</div>
              </div>
              <span className="text-2xl font-bold">flowers_uz</span>
            </div>
            <p className="text-gray-400 max-w-md">
              The premier destination for luxury neon floral arrangements in Uzbekistan. Bringing light and life to your special moments.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#shop" className="hover:text-pink-500 transition">Shop</a></li>
              <li><a href="#about" className="hover:text-pink-500 transition">About Us</a></li>
              <li><a href="#gallery" className="hover:text-pink-500 transition">Gallery</a></li>
              <li><a href="#contact" className="hover:text-pink-500 transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li>Tashkent, Uzbekistan</li>
              <li>+998 90 123 45 67</li>
              <li>info@flowers-uz.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-sm">
          © 2024 flowers_uz. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FlowersUZ;
