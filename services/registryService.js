const API_BASE_URL = '/api/products';
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const mapProduct = (item) => {
    const barcode = item.code || '0';
    const seed = parseInt(barcode.slice(-4), 10) || 500;
    const price = (seed % 1500) + 100;
    return {
        id: item.code || `sku-${Math.random().toString(36).slice(2, 11)}`,
        name: item.product_name || 'Premium Organic Product',
        image: item.image_front_url || item.image_url || '',
        price,
        originalPrice: Math.round(price * 1.25),
        rating: (seed % 15) / 10 + 3.5,
        reviewCount: (seed * 3) % 1000,
        store: item.brands?.split(',')[0] || 'BigBasket',
        features: [item.labels?.split(',')[0] || 'Quality Tested', item.packaging || 'Recyclable Pack', `Origin: ${item.countries || 'India'}`].filter(Boolean),
        description: item.ingredients_text || `A high-quality selection curated from ${item.brands || 'sustainable sources'}.`,
        link: item.code ? `https://in.openfoodfacts.org/product/${item.code}` : '#'
    };
};

export const searchProducts = async (query, page = 1, pageSize = 12) => {
    const params = new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        tagtype_0: 'labels',
        tag_contains_0: 'contains',
        tag_0: 'organic',
        page: String(page),
        page_size: String(pageSize)
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
                signal: controller.signal,
                headers: { Accept: 'application/json', 'User-Agent': 'EcoSearch-College-Project/1.0' }
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                if (RETRYABLE_STATUSES.has(response.status) && attempt < 2) {
                    await wait(1000 * (attempt + 1));
                    continue;
                }
                return { products: [], page, totalPages: 1, totalCount: 0 };
            }
            const data = await response.json();
            const totalCount = data.count || 0;
            return {
                products: (data.products || []).map(mapProduct),
                page,
                totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
                totalCount
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (attempt < 2) {
                await wait(1000 * (attempt + 1));
                continue;
            }
            console.error('Registry Fetch Error:', error);
            return { products: [], page, totalPages: 1, totalCount: 0 };
        }
    }

    return { products: [], page, totalPages: 1, totalCount: 0 };
};
