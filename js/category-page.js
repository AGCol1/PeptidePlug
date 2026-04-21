document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("categoryProductGrid");
    if (!grid || !window.PRODUCTS) return;

    const fileName = window.location.pathname.split("/").pop().toLowerCase();

    const pageCategoryMap = {
        "peptides.html": "peptides",
        "bundles.html": "bundles",
        "blends.html": "blends",
        "lab-supplies.html": "lab-supplies"
    };

    const selectedCategory = pageCategoryMap[fileName];
    if (!selectedCategory) return;

    const filteredProducts = window.PRODUCTS.filter(product => product.category === selectedCategory);

    if (!filteredProducts.length) {
        grid.innerHTML = `<p class="no-products">No products found in this category.</p>`;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
    <div class="product fade-in active">
      <div class="image-box small">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-card-body">
        ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ""}
        <h3>${product.name}</h3>
        <p>${product.price}</p>
        <div class="buttons">
          <a href="../product.html?slug=${product.slug}" class="btn">View Product</a>
          <button type="button" class="btn secondary add-to-basket-btn" data-slug="${product.slug}">
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  `).join("");

    const addToBasketButtons = grid.querySelectorAll(".add-to-basket-btn");

    addToBasketButtons.forEach(button => {
        button.addEventListener("click", event => {
            const slug = button.getAttribute("data-slug");
            const product = window.PRODUCTS.find(item => item.slug === slug);

            if (!product) return;

            let basketProduct = { ...product };

            if (!basketProduct.variantId && Array.isArray(basketProduct.variantOptions) && basketProduct.variantOptions.length) {
                basketProduct.variantId = basketProduct.variantOptions[0].variantId;
                basketProduct.selectedOptionLabel = basketProduct.variantOptions[0].label || "";
                basketProduct.price = basketProduct.variantOptions[0].price || basketProduct.price;
            }

            if (!basketProduct.variantId) {
                window.location.href = `../product.html?slug=${basketProduct.slug}`;
                return;
            }

            if (window.PP_CART && typeof window.PP_CART.addToBasket === "function") {
                window.PP_CART.addToBasket(basketProduct, 1);
            }

            if (typeof window.animateProductToBasket === "function") {
                window.animateProductToBasket(event.currentTarget, basketProduct.image);
            }
        });
    });
});