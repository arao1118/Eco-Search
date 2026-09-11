import { useState, useEffect, useCallback } from 'react';
import { Loader2, ShoppingCart, Star, Scale, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';

import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ComparisonView from './components/ComparisonView';
import ProductDetailsModal from './components/ProductDetailsModal';


import { subscribeToAuthChanges, logoutUser } from '../services/authService';
import {
    fetchUserCart,
    addItemToCloudCart,
    updateItemQuantityInCloud,
    removeItemFromCloudCart
} from '../services/cartService';
import { searchProducts } from '../services/registryService';

const HOME_CATEGORIES = [
    { id: 'personal-care', name: 'Personal Care', query: 'personal care' },
    { id: 'beverages', name: 'Organic Beverages', query: 'juice' },
    { id: 'superfoods', name: 'Organic Superfoods', query: 'quinoa' },
    { id: 'spices-staples', name: 'Spices & Staples', query: 'turmeric' }
];

const MAX_COMPARE = 3;
const PAGE_SIZE = 12;

const emptyCategoryState = () => ({ products: [], loading: true, page: 1, totalPages: 1 });

const ProductCard = ({ product, onSelect, onAddToCart, isComparing, onToggleCompare }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
        <button
            type="button"
            onClick={() => onSelect(product)}
            className="h-40 bg-stone-50 flex items-center justify-center p-4 border-b border-slate-100"
        >
            {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
                <Leaf className="text-slate-200" size={40} />
            )}
        </button>

        <div className="p-4 flex flex-col flex-1">
            <h3
                className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 mb-1 cursor-pointer hover:text-emerald-700"
                onClick={() => onSelect(product)}
            >
                {product.name}
            </h3>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {product.store}
            </p>

            <div className="flex items-center text-xs text-amber-600 font-bold mb-3">
                <Star size={12} className="mr-1 fill-current" />
                {product.rating.toFixed(1)}
                <span className="text-slate-300 font-medium ml-1">({product.reviewCount})</span>
            </div>

            <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">
                    ₹{product.price.toLocaleString('en-IN')}
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                    <ShoppingCart size={14} />
                    Add
                </button>

                <button
                    type="button"
                    onClick={() => onToggleCompare(product)}
                    title="Add to comparison"
                    className={`px-3 rounded-lg border text-xs font-bold transition-colors ${isComparing
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Scale size={14} />
                </button>
            </div>
        </div>
    </div>
);

const Pagination = ({ page, totalPages, onPageChange, disabled }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                type="button"
                disabled={disabled || page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
                Previous
            </button>

            <span className="text-sm font-bold text-slate-500">
                Page {page} of {totalPages}
            </span>

            <button
                type="button"
                disabled={disabled || page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

const ProductGrid = ({ products, loading, emptyMessage, ...cardProps }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    if (products.length === 0) {
        return <p className="text-slate-400 text-sm py-8">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
                <ProductCard key={p.id} product={p} {...cardProps} />
            ))}
        </div>
    );
};

const App = () => {
    const [authLoading, setAuthLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [view, setView] = useState('home'); // 'home' | 'search'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchPage, setSearchPage] = useState(1);
    const [searchTotalPages, setSearchTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);

    const [categoryData, setCategoryData] = useState(() =>
        HOME_CATEGORIES.reduce((acc, cat) => {
            acc[cat.id] = emptyCategoryState();
            return acc;
        }, {})
    );

    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [comparisonList, setComparisonList] = useState([]);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (existingUser) => {
            setUser(existingUser);
            setAuthLoading(false);

            if (existingUser) {
                const items = await fetchUserCart(existingUser.id);
                setCartItems(items);
            }
        });

        return unsubscribe;
    }, []);

    const loadCategoryPage = useCallback(async (cat, page) => {
        setCategoryData((prev) => ({
            ...prev,
            [cat.id]: { ...prev[cat.id], loading: true }
        }));

        const { products, totalPages } = await searchProducts(cat.query, page, PAGE_SIZE);

        setCategoryData((prev) => ({
            ...prev,
            [cat.id]: { products, loading: false, page, totalPages }
        }));
    }, []);

    // --- Load homepage category rows once logged in ---
    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        const loadCategories = async () => {
            for (const cat of HOME_CATEGORIES) {
                if (cancelled) return;
                await loadCategoryPage(cat, 1);
            }
        };

        loadCategories();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleAuthSuccess = useCallback(async (loggedInUser) => {
        setUser(loggedInUser);
        const items = await fetchUserCart(loggedInUser.id);
        setCartItems(items);
    }, []);

    const handleLogout = useCallback(async () => {
        await logoutUser();
        setUser(null);
        setCartItems([]);
        setComparisonList([]);
        setSelectedProduct(null);
        setIsCartOpen(false);
        setIsComparisonOpen(false);
        setView('home');
    }, []);

    const handleSearch = useCallback(async (query, page = 1) => {
        setSearchQuery(query);
        setView('search');
        setIsSearching(true);
        const { products, totalPages } = await searchProducts(query, page, PAGE_SIZE);
        setSearchResults(products);
        setSearchPage(page);
        setSearchTotalPages(totalPages);
        setIsSearching(false);
    }, []);

    const handleSearchPageChange = useCallback(
        (newPage) => {
            handleSearch(searchQuery, newPage);
        },
        [handleSearch, searchQuery]
    );

    const handleHome = useCallback(() => {
        setView('home');
    }, []);

    const handleAddToCart = useCallback(
        async (product) => {
            if (!user) return;
            const newCart = await addItemToCloudCart(user.id, product, cartItems);
            setCartItems(newCart);
        },
        [user, cartItems]
    );

    const handleUpdateQuantity = useCallback(
        async (productId, delta) => {
            if (!user) return;
            const newCart = await updateItemQuantityInCloud(user.id, productId, delta, cartItems);
            setCartItems(newCart);
        },
        [user, cartItems]
    );

    const handleRemoveFromCart = useCallback(
        async (productId) => {
            if (!user) return;
            const newCart = await removeItemFromCloudCart(user.id, productId, cartItems);
            setCartItems(newCart);
        },
        [user, cartItems]
    );

    const handleToggleCompare = useCallback((product) => {
        setComparisonList((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) return prev.filter((p) => p.id !== product.id);
            if (prev.length >= MAX_COMPARE) {
                alert(`You can compare up to ${MAX_COMPARE} products at a time.`);
                return prev;
            }
            return [...prev, product];
        });
    }, []);

    const handleRemoveFromComparison = useCallback((productId) => {
        setComparisonList((prev) => prev.filter((p) => p.id !== productId));
    }, []);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    if (!user) {
        return <LandingPage onAuthSuccess={handleAuthSuccess} />;
    }

    const comparisonIds = new Set(comparisonList.map((p) => p.id));

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar
                user={user}
                cartCount={cartItems.length}
                onSearch={handleSearch}
                onLogout={handleLogout}
                onOpenCart={() => setIsCartOpen(true)}
                onHome={handleHome}
                isSearching={isSearching}
            />

            {view === 'search' ? (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">
                        Results for &ldquo;{searchQuery}&rdquo;
                    </h2>

                    <ProductGrid
                        products={searchResults}
                        loading={isSearching}
                        emptyMessage="No matching organic products found. Try a different keyword."
                        onSelect={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                        onToggleCompare={handleToggleCompare}
                        isComparing={false}
                    />

                    <Pagination
                        page={searchPage}
                        totalPages={searchTotalPages}
                        onPageChange={handleSearchPageChange}
                        disabled={isSearching}
                    />
                </section>
            ) : (
                <>
                    {HOME_CATEGORIES.map((cat) => (
                        <section
                            key={cat.id}
                            id={cat.id}
                            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20"
                        >
                            <h2 className="text-2xl font-black text-slate-900 mb-6">{cat.name}</h2>

                            <ProductGrid
                                products={categoryData[cat.id].products}
                                loading={categoryData[cat.id].loading}
                                emptyMessage="No products available in this category right now."
                                onSelect={setSelectedProduct}
                                onAddToCart={handleAddToCart}
                                onToggleCompare={handleToggleCompare}
                                isComparing={false}
                            />

                            <Pagination
                                page={categoryData[cat.id].page}
                                totalPages={categoryData[cat.id].totalPages}
                                onPageChange={(p) => loadCategoryPage(cat, p)}
                                disabled={categoryData[cat.id].loading}
                            />
                        </section>
                    ))}

                    <footer
                        id="about-footer"
                        className="bg-emerald-900 text-emerald-100 mt-12 py-12 px-4 sm:px-6 lg:px-8"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center space-x-2 mb-3">
                                <Leaf className="text-green-400" size={22} />
                                <span className="text-xl font-bold text-white">
                                    Eco<span className="text-green-400">Search</span>
                                </span>
                            </div>
                            <p className="text-sm max-w-xl text-emerald-200">
                                EcoSearch compares organic and sustainable products across Indian retailers
                                using live data from Open Food Facts. Built as a college project.
                            </p>
                        </div>
                    </footer>
                </>
            )}

            {/* Floating comparison bar */}
            {comparisonList.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white shadow-2xl border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {comparisonList.map((p) => (
                            <div
                                key={p.id}
                                className="w-10 h-10 rounded-full border-2 border-white bg-stone-50 overflow-hidden flex items-center justify-center"
                            >
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Leaf size={16} className="text-slate-300" />
                                )}
                            </div>
                        ))}
                    </div>

                    <span className="text-sm font-bold text-slate-700">
                        {comparisonList.length} selected
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsComparisonOpen(true)}
                        disabled={comparisonList.length < 2}
                        className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                        Compare
                    </button>

                    <button
                        type="button"
                        onClick={() => setComparisonList([])}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                        Clear
                    </button>
                </div>
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
            />

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                />
            )}

            {isComparisonOpen && (
                <ComparisonView
                    products={comparisonList}
                    onClose={() => setIsComparisonOpen(false)}
                    onRemoveProduct={handleRemoveFromComparison}
                />
            )}
        </div>
    );
};

export default App;
