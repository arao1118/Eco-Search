const API_BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export const searchProducts = async (query) => {
    const response = await fetch(`${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=16`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.products || []).map((item) => ({
        id: item.code || `item-${Math.random()}`,
        name: item.product_name || 'Unknown Product',
        image: item.image_front_url || item.image_url || '',
        price: 500,
        originalPrice: 600,
        rating: 4,
        reviewCount: 0,
        store: item.brands?.split(',')[0] || 'BigBasket',
        features: [item.labels?.split(',')[0] || 'Organic Certified', item.packaging || 'Eco-friendly pack', `Origin: ${item.countries || 'India'}`].filter(Boolean),
        description: item.ingredients_text || `High quality ${query} product.`,
        link: item.code ? `https://in.openfoodfacts.org/product/${item.code}` : '#'
    }));
};
