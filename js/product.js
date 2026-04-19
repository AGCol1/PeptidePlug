const productPage = document.getElementById("productPage");

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  return window.PRODUCTS.find(product => product.slug === slug);
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

function setupProductActions(product) {
  const addToBasketBtn = document.getElementById("addToBasketBtn");
  const buyNowBtn = document.getElementById("buyNowBtn");

  if (addToBasketBtn) {
    addToBasketBtn.addEventListener("click", () => {
      window.PP_CART.addToBasket(product, 1);
      addToBasketBtn.textContent = "Added to Basket";

      setTimeout(() => {
        addToBasketBtn.textContent = "Add to Basket";
      }, 1200);
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      window.PP_CART.buyNow(product);
    });
  }
}

function renderProductPage() {
  if (!productPage) return;

  if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
    productPage.innerHTML = "<p>Products failed to load.</p>";
    return;
  }

  const product = getProductFromUrl();

  if (!product) {
    productPage.innerHTML = "<p>Product not found.</p>";
    return;
  }

  const outOfStock = window.PP_CART.isProductOutOfStock(product);
  const availabilityText = outOfStock ? "Out of Stock" : "In Stock";

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
        <p><strong>Availability:</strong> <span class="${outOfStock ? "stock-out" : "stock-in"}">${availabilityText}</span></p>
      </div>

      <div class="buttons">
        ${
          outOfStock
            ? `<button class="btn disabled" disabled aria-disabled="true">Out of Stock</button>`
            : `
              <button type="button" class="btn secondary" id="addToBasketBtn">Add to Basket</button>
              <button type="button" class="btn" id="buyNowBtn">Buy Now</button>
            `
        }
      </div>
    </div>
  `;

  setupDescriptionToggle();
  setupProductActions(product);
}

document.addEventListener("DOMContentLoaded", renderProductPage);