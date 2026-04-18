const productPage = document.getElementById("productPage");

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  return window.PRODUCTS.find(product => product.slug === slug);
}

function getAddToCartLink(variantId) {
  return `https://${window.SITE_CONFIG.shopifyDomain}/cart/${variantId}:1`;
}

function setupDescriptionToggle() {
  const descriptionContent = document.getElementById("productDescriptionContent");
  const toggleButton = document.getElementById("descriptionToggleBtn");

  if (!descriptionContent || !toggleButton) return;

  toggleButton.addEventListener("click", () => {
    const isExpanded = descriptionContent.classList.toggle("expanded");
    toggleButton.textContent = isExpanded ? "Read Less" : "Read More";
  });
}

function renderProductPage() {
  if (!productPage) return;

  const product = getProductFromUrl();

  if (!product) {
    productPage.innerHTML = "<p>Product not found.</p>";
    return;
  }

  const isOutOfStock = product.availability === false || product.availability === "false";
  const availabilityText = isOutOfStock ? "Out of Stock" : "In Stock";
  document.title = `${product.name} - Peptide Plug`;

  productPage.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}">
    </div>

    <div class="product-info">
      <h1>${product.name}</h1>
      <p class="product-price">${product.price}</p>

      <div class="product-description">
        <div class="product-description-content" id="productDescriptionContent">
          ${product.description}
        </div>
        <button type="button" class="btn secondary description-toggle-btn" id="descriptionToggleBtn">
          Read More
        </button>
      </div>

      <div class="product-meta">
        <p><strong>Strength:</strong> ${product.strength}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Availability:</strong> <span class="${isOutOfStock ? "stock-out" : "stock-in"}">${availabilityText}</span></p>

      <div class="buttons">
        ${isOutOfStock
      ? `
              <button class="btn disabled" disabled aria-disabled="true">Out of Stock</button>
              <button class="btn secondary disabled" disabled aria-disabled="true">Unavailable</button>
            `
      : `
              <a href="${getAddToCartLink(product.variantId)}" class="btn">Add to Basket</a>
              <a href="${getAddToCartLink(product.variantId)}" class="btn secondary">Checkout Now</a>
            `
    }
      </div>
    </div>
  `;

  setupDescriptionToggle();
}

document.addEventListener("DOMContentLoaded", renderProductPage);