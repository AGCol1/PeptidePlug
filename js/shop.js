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

  function getAddToCartLink(variantId) {
    return `https://${window.SITE_CONFIG.shopifyDomain}/cart/${variantId}:1?channel=buy_button`;
  }

  function createProductCard(product) {
    return `
      <div class="product fade-in active">
        <div class="image-box small">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p>${product.price}</p>
        <div class="buttons">
          <a href="product.html?slug=${product.slug}" class="btn">Buy Now</a>
          <a href="${getAddToCartLink(product.variantId)}" class="btn secondary">Add to Basket</a>
        </div>
      </div>
    `;
  }

  productGrid.innerHTML = window.PRODUCTS.map(createProductCard).join("");
  console.log("Products rendered:", window.PRODUCTS.length);
});