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
    const isOutOfStock = product.availability === false || product.availability === "false";
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
        <a
          href="${isOutOfStock ? "#" : `product.html?slug=${product.slug}`}"
          class="btn ${isOutOfStock ? "disabled" : ""}"
          ${isOutOfStock ? 'onclick="return false;" aria-disabled="true"' : ""}
        >
          Buy Now
        </a>
      </div>
    </div>
  `;
  }

  productGrid.innerHTML = window.PRODUCTS.map(createProductCard).join("");
  console.log("Products rendered:", window.PRODUCTS.length);
});