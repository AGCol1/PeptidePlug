// products.js
// Lightweight loader that fetches active products from the server-side DB

window.PRODUCTS = [];

window.loadProducts = async function(category) {
  try {
    const url = category ? `/api/products.php?category=${encodeURIComponent(category)}` : '/api/products.php';
    const res = await fetch(url);
    const json = await res.json();
    if (res.ok && json.success) {
      window.PRODUCTS = (json.products || []).map(p => ({
        ...p,
        // normalize price to number when possible
        price: (p.price === null || p.price === '') ? 0 : Number(p.price),
        image: p.image || '',
        slug: p.slug,
        name: p.name,
        category: p.category || '',
        short_description: p.short_description || '',
        description: p.description || '',
        active: Number(p.active),
        product_id: p.id || null,
        variantId: String(p.variantId ?? p.id ?? p.slug)
      }));
      document.dispatchEvent(new Event('products:loaded'));
      return window.PRODUCTS;
    }
    console.error('Products API error', json);
    return [];
  } catch (e) {
    console.error('Failed to load products', e);
    return [];
  }
};
