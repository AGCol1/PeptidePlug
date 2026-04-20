document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");

  if (!productGrid) {
    console.log("productGrid not found");
    return;
  }

  if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
    console.log("PRODUCTS not loaded");
    return;
  }

  function getProductLink(slug) {
    return `product.html?slug=${encodeURIComponent(slug)}`;
  }

  function createProductCard(product) {
    const outOfStock =
      window.PP_CART &&
      typeof window.PP_CART.isProductOutOfStock === "function"
        ? window.PP_CART.isProductOutOfStock(product)
        : false;

    return `
      <div class="product fade-in active">
        <div class="image-box small">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-card-body">
          ${product.tag ? `<span class="product-badge">${product.tag}</span>` : ""}
          <h3>${product.name}</h3>
          <p>${product.price}</p>

          <div class="buttons">
            <a href="${getProductLink(product.slug)}" class="btn">Buy Now</a>
            ${
              outOfStock
                ? `<button type="button" class="btn secondary disabled" disabled aria-disabled="true">Out of Stock</button>`
                : `<button type="button" class="btn secondary add-to-basket-btn" data-slug="${product.slug}">Add to Basket</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderProducts(productsToRender) {
    productGrid.innerHTML = productsToRender.map(createProductCard).join("");
    setupAddToBasketButtons();
  }

  function setupAddToBasketButtons() {
    const buttons = document.querySelectorAll(".add-to-basket-btn");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const slug = button.getAttribute("data-slug");
        const product = window.PRODUCTS.find(item => item.slug === slug);

        if (!product) {
          console.log("Product not found for slug:", slug);
          return;
        }

        const basketProduct = {
          ...product,
          variantId: product.variantId,
          price: product.price
        };

        if (window.PP_CART && typeof window.PP_CART.addToBasket === "function") {
          window.PP_CART.addToBasket(basketProduct, 1);

          const originalText = button.textContent;
          button.textContent = "Added";
          button.disabled = true;

          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 1200);
        } else {
          console.log("PP_CART is not available");
        }
      });
    });
  }

  renderProducts(window.PRODUCTS);

  console.log("Products rendered:", window.PRODUCTS.length);
});