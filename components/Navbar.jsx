import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  LogOut,
  Menu,
  X,
  Leaf,
  Home,
  Grid,
  Info,
  ChevronDown
} from 'lucide-react';

const CATEGORIES_LIST = [
  {
    id: 'personal-care',
    name: 'Personal Care'
  },
  {
    id: 'beverages',
    name: 'Organic Beverages'
  },
  {
    id: 'superfoods',
    name: 'Organic Superfoods'
  },
  {
    id: 'spices-staples',
    name: 'Spices & Staples'
  }
];

const Navbar = ({
  user,
  cartCount,
  onSearch,
  onLogout,
  onOpenCart,
  onHome,
  isSearching
}) => {
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] =
    useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      onSearch(query);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      onHome();

      setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: 'smooth'
          });
      }, 100);
    }

    setIsMobileMenuOpen(false);
    setIsCatDropdownOpen(false);
  };

  return (
    <nav className="bg-emerald-900 text-white sticky top-0 z-50 shadow-lg">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center order-1">
            <button
              onClick={() =>
                setIsMobileMenuOpen(
                  !isMobileMenuOpen
                )
              }
              className="text-emerald-200 hover:text-white p-2"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center order-2 md:order-1">

            <div
              className="flex-shrink-0 flex items-center cursor-pointer space-x-2 mr-8"
              onClick={onHome}
            >
              <Leaf
                className="text-green-400"
                size={24}
              />

              <span className="text-2xl font-bold text-white">
                Eco
                <span className="text-green-400">
                  Search
                </span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-4">

              <button
                onClick={onHome}
                className="px-3 py-2 rounded-md text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-all flex items-center space-x-1"
              >
                <Home size={16} />
                <span>Home</span>
              </button>

              {/* Categories Dropdown */}
              <div className="relative">

                <button
                  onMouseEnter={() =>
                    setIsCatDropdownOpen(true)
                  }
                  onClick={() =>
                    setIsCatDropdownOpen(
                      !isCatDropdownOpen
                    )
                  }
                  className="px-3 py-2 rounded-md text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-all flex items-center space-x-1"
                >
                  <Grid size={16} />

                  <span>Categories</span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isCatDropdownOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />
                </button>

                {isCatDropdownOpen && (
                  <div
                    className="absolute top-full left-0 w-48 bg-white text-slate-900 rounded-xl shadow-2xl py-2 mt-1 border border-slate-100 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() =>
                      setIsCatDropdownOpen(false)
                    }
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          scrollToSection(cat.id)
                        }
                        className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              <button
                onClick={() =>
                  scrollToSection('about-footer')
                }
                className="px-3 py-2 rounded-md text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-all flex items-center space-x-1"
              >
                <Info size={16} />
                <span>About</span>
              </button>

            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-xl mx-8 order-2">

            <form
              onSubmit={handleSubmit}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search real organic products..."
                className="w-full bg-emerald-800 text-white rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 border border-emerald-700 placeholder-emerald-300 transition-all"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
              />

              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-0 top-0 mt-2 mr-3 text-emerald-300 hover:text-white"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </button>
            </form>

          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 order-3">

            <button
              onClick={onOpenCart}
              className="relative p-2 text-emerald-200 hover:text-white transition-colors"
            >
              <ShoppingCart size={24} />

              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-emerald-900 transform translate-x-1/4 -translate-y-1/4 bg-green-400 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {user && (
              <div className="hidden sm:flex items-center space-x-3 ml-2 border-l border-emerald-800 pl-4">

                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-emerald-800 hover:bg-red-900/40 text-emerald-300 hover:text-red-200 border border-emerald-700 transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-emerald-800 px-4 pt-2 pb-6 space-y-4 border-t border-emerald-700 animate-in slide-in-from-left-4 duration-200">

          <form
            onSubmit={handleSubmit}
            className="relative mt-2"
          >
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-emerald-900 text-white rounded-md py-2 pl-3 pr-10 border border-emerald-700"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
            />

            <button
              type="submit"
              className="absolute right-2 top-2.5 text-emerald-400"
              title="Search"
            >
              <Search size={18} />
            </button>
          </form>

          <div className="grid grid-cols-1 gap-1">

            <button
              onClick={() => {
                onHome();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 p-3 bg-emerald-900/50 rounded-lg text-emerald-100 font-bold"
            >
              <Home size={18} />
              <span>Home</span>
            </button>

            <div className="p-3">

              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-2">
                Categories
              </span>

              <div className="grid grid-cols-2 gap-2">

                {CATEGORIES_LIST.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      scrollToSection(cat.id)
                    }
                    className="flex items-center space-x-2 p-2 bg-emerald-900 rounded text-xs text-emerald-100"
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>{cat.name}</span>
                  </button>
                ))}

              </div>
            </div>

            <button
              onClick={() =>
                scrollToSection('about-footer')
              }
              className="flex items-center space-x-3 p-3 bg-emerald-900/50 rounded-lg text-emerald-100 font-bold"
            >
              <Info size={18} />
              <span>About Us</span>
            </button>

          </div>

          <div className="flex justify-between items-center border-t border-emerald-700 pt-4 px-2">

            <button
              onClick={() => {
                onOpenCart();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-emerald-100"
            >
              <ShoppingCart size={20} />
              <span className="font-medium">
                Cart ({cartCount})
              </span>
            </button>

            {user && (
              <button
                onClick={onLogout}
                className="text-red-300 flex items-center space-x-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}

          </div>

        </div>
      )}

    </nav>
  );
};

export default Navbar;