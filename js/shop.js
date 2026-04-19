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

  function createProductCard(product) {
    const isOutOfStock = window.PP_CART.isProductOutOfStock(product);
    const availabilityText = isOutOfStock ? "Out of Stock" : "In Stock";

    return `
      <div class="product fade-in active ${isOutOfStock ? "out-of-stock" : ""}">
        <div class="image-box small">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p>${product.price}</p>
        <p class="availability ${isOutOfStock ? "out" : "in"}">${availabilityText}</p>
        <div class="buttons">
          ${
            isOutOfStock
              ? `<button class="btn disabled" disabled aria-disabled="true">Out of Stock</button>`
              : `
                <a href="product.html?slug=${product.slug}" class="btn secondary">View Product</a>
                <button class="btn add-to-basket-btn" type="button" data-slug="${product.slug}">Add to Basket</button>
              `
          }
        </div>
      </div>
    `;
  }

  productGrid.innerHTML = window.PRODUCTS.map(createProductCard).join("");

  document.querySelectorAll(".add-to-basket-btn").forEach(button => {
    button.addEventListener("click", () => {
      const slug = button.getAttribute("data-slug");
      const product = window.PRODUCTS.find(item => item.slug === slug);

      if (!product) return;

      window.PP_CART.addToBasket(product, 1);
      button.textContent = "Added";

      setTimeout(() => {
        button.textContent = "Add to Basket";
      }, 1200);
    });
  });

  console.log("Products rendered:", window.PRODUCTS.length);
});