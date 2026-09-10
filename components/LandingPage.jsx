import React, { useEffect, useState } from 'react';
import {
  Leaf,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sprout,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import {
  loginUser,
  registerUser
} from '../services/authService';

const LandingPage = ({ onAuthSuccess }) => {
  const getAuthMode = () => window.location.pathname === '/register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState(getAuthMode);
  const isLogin = authMode === 'login';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const handleRouteChange = () => setAuthMode(getAuthMode());
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setShowSuccess(false);
  }, [authMode]);

  const navigateToAuthMode = (mode) => {
    const path = mode === 'register' ? '/register' : '/login';
    window.history.pushState({}, '', path);
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await loginUser(
          formData.email,
          formData.password
        );

        onAuthSuccess(user);
      } else {
        if (!formData.name) {
          throw new Error(
            "Full name is required"
          );
        }

        if (formData.password.length < 6) {
          throw new Error(
            "Password must be at least 6 characters"
          );
        }

        const user = await registerUser(
          formData.name,
          formData.email,
          formData.password
        );

        setShowSuccess(true);

        setTimeout(() => {
          onAuthSuccess(user);
        }, 1500);
      }

    } catch (err) {
      setError(
        err.message ||
        "An authentication error occurred"
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans relative">

      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all transform animate-bounce">

          <CheckCircle
            size={28}
            className="text-white"
          />

          <div>
            <h4 className="font-bold text-lg">
              Account Created!
            </h4>

            <p className="text-emerald-100 text-sm">
              Welcome to EcoSearch.
            </p>
          </div>

        </div>
      )}

      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 relative overflow-hidden items-center justify-center text-white p-12">

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />

        <div className="relative z-10 max-w-lg">

          <div className="flex items-center space-x-3 mb-8">

            <Leaf
              size={48}
              className="text-green-400"
            />

            <span className="text-5xl font-bold">
              Eco
              <span className="text-green-400">
                Search
              </span>
            </span>

          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Discover the Purest
            <br />
            Sustainable Products in India
          </h1>

          <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
            Join our community to compare prices,
            verify ingredients, and shop sustainably
            from India's top retailers using verified
            public data.
          </p>

        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">

        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">

            <Leaf
              size={32}
              className="text-green-600"
            />

            <span className="text-2xl font-bold text-stone-900">
              EcoSearch
            </span>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              {isLogin
                ? 'Welcome Back'
                : 'Create Account'}
            </h2>

            <p className="mt-2 text-stone-500 font-medium">
              {isLogin
                ? 'Enter your details to access your account'
                : 'Start your sustainable journey today'}
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start animate-in fade-in slide-in-from-top-2">

              <AlertCircle
                size={18}
                className="mr-2 mt-0.5 flex-shrink-0"
              />

              <span>{error}</span>

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 mt-8"
          >

            {/* Name */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4">

                <label className="block text-sm font-bold text-stone-700 mb-1.5 ml-1">
                  Full Name
                </label>

                <div className="relative group">

                  <User
                    className="absolute left-4 top-3.5 text-stone-400 group-focus-within:text-emerald-600 transition-colors"
                    size={20}
                  />

                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 shadow-sm"
                    value={formData.name}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                  />

                </div>
              </div>
            )}

            {/* Email */}
            <div>

              <label className="block text-sm font-bold text-stone-700 mb-1.5 ml-1">
                Email Address
              </label>

              <div className="relative group">

                <Mail
                  className="absolute left-4 top-3.5 text-stone-400 group-focus-within:text-emerald-600 transition-colors"
                  size={20}
                />

                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 shadow-sm"
                  value={formData.email}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                />

              </div>
            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-bold text-stone-700 mb-1.5 ml-1"
              >
                Password
              </label>

              <div className="relative group">

                <Lock
                  className="absolute left-4 top-3.5 text-stone-400 group-focus-within:text-emerald-600 transition-colors"
                  size={20}
                />

                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300 shadow-sm"
                  value={formData.password}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      password: e.target.value
                    })
                  }
                />

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 rounded-2xl transition-all transform hover:scale-[1.01] shadow-xl shadow-emerald-700/20 flex items-center justify-center space-x-2 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
            >

              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isLogin
                      ? 'Sign In to EcoSearch'
                      : 'Start My Journey'}
                  </span>

                  <ArrowRight size={20} />
                </>
              )}

            </button>

          </form>

          {/* Login/Register Toggle */}
          <div className="mt-8 text-center bg-stone-100/50 p-4 rounded-2xl border border-stone-200/50">

            <p className="text-stone-600 text-sm font-medium">

              {isLogin
                ? "New to EcoSearch? "
                : "Already have an account? "}

              <button
                type="button"
                onClick={() => {
                  navigateToAuthMode(isLogin ? 'register' : 'login');
                }}
                className="text-emerald-700 font-black hover:underline underline-offset-4"
              >
                {isLogin
                  ? 'Create Account'
                  : 'Log In'}
              </button>

            </p>
          </div>

          

        </div>
      </div>
    </div>
  );
};

export default LandingPage;