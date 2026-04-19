const productPage = document.getElementById("productPage");
let currentImageIndex = 0;

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

function getProductImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  return [product.image];
}

function getSelectedVariant(product) {
  const variantSelect = document.getElementById("productVariantSelect");

  if (variantSelect && Array.isArray(product.variantOptions) && product.variantOptions.length) {
    const selectedVariantId = variantSelect.value;
    return product.variantOptions.find(option => option.variantId === selectedVariantId) || product.variantOptions[0];
  }

  if (Array.isArray(product.variantOptions) && product.variantOptions.length) {
    return product.variantOptions[0];
  }

  return {
    label: product.name,
    variantId: product.variantId,
    price: product.price
  };
}

function renderVariantSelector(product) {
  if (!Array.isArray(product.variantOptions) || product.variantOptions.length <= 1) {
    return "";
  }

  return `
    <div class="product-variant-wrap">
      <label for="productVariantSelect" class="product-variant-label">Choose option</label>
      <select id="productVariantSelect" class="product-variant-select">
        ${product.variantOptions.map((option, index) => `
          <option value="${option.variantId}" ${index === 0 ? "selected" : ""}>
            ${option.label}
          </option>
        `).join("")}
      </select>
    </div>
  `;
}

function renderProductImageSection(product) {
  const images = getProductImages(product);

  if (images.length <= 1) {
    return `
      <div class="product-image-wrap">
        <img src="${images[0]}" alt="${product.name}">
      </div>
    `;
  }

  return `
    <div class="product-image-wrap">
      <div class="product-image-slider">
        <button class="product-image-nav prev" id="productImagePrev" type="button" aria-label="Previous image">‹</button>
        <img src="${images[0]}" alt="${product.name}" id="productMainImage">
        <button class="product-image-nav next" id="productImageNext" type="button" aria-label="Next image">›</button>
      </div>

      <div class="product-image-dots" id="productImageDots">
        ${images.map((_, index) => `
          <button
            type="button"
            class="product-image-dot ${index === 0 ? "active" : ""}"
            data-index="${index}"
            aria-label="Go to image ${index + 1}"
          ></button>
        `).join("")}
      </div>
    </div>
  `;
}

function setupImageSlider(product) {
  const images = getProductImages(product);

  if (images.length <= 1) return;

  const mainImage = document.getElementById("productMainImage");
  const prevButton = document.getElementById("productImagePrev");
  const nextButton = document.getElementById("productImageNext");
  const dots = document.querySelectorAll(".product-image-dot");

  if (!mainImage || !prevButton || !nextButton || !dots.length) return;

  function updateSlider(index) {
    currentImageIndex = index;
    mainImage.src = images[currentImageIndex];

    dots.forEach(dot => {
      dot.classList.remove("active");
    });

    const activeDot = document.querySelector(`.product-image-dot[data-index="${currentImageIndex}"]`);
    if (activeDot) {
      activeDot.classList.add("active");
    }
  }

  function showNextImage() {
    const nextIndex = (currentImageIndex + 1) % images.length;
    updateSlider(nextIndex);
  }

  function showPrevImage() {
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateSlider(prevIndex);
  }

  prevButton.addEventListener("click", showPrevImage);
  nextButton.addEventListener("click", showNextImage);

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = Number(dot.getAttribute("data-index"));
      updateSlider(index);
    });
  });
}

function setupVariantSelector(product) {
  const variantSelect = document.getElementById("productVariantSelect");
  const productPrice = document.getElementById("productPrice");

  if (!variantSelect || !productPrice || !Array.isArray(product.variantOptions)) return;

  variantSelect.addEventListener("change", () => {
    const selectedVariant = getSelectedVariant(product);
    productPrice.textContent = selectedVariant.price || product.price;
  });
}

function setupProductActions(product) {
  const addToBasketBtn = document.getElementById("addToBasketBtn");
  const buyNowBtn = document.getElementById("buyNowBtn");

  if (addToBasketBtn) {
    addToBasketBtn.addEventListener("click", () => {
      const selectedVariant = getSelectedVariant(product);

      const basketProduct = {
        ...product,
        variantId: selectedVariant.variantId,
        price: selectedVariant.price || product.price,
        selectedOptionLabel: selectedVariant.label
      };

      window.PP_CART.addToBasket(basketProduct, 1);
      addToBasketBtn.textContent = "Added to Basket";

      setTimeout(() => {
        addToBasketBtn.textContent = "Add to Basket";
      }, 1200);
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const selectedVariant = getSelectedVariant(product);

      const buyNowProduct = {
        ...product,
        variantId: selectedVariant.variantId,
        price: selectedVariant.price || product.price
      };

      window.PP_CART.buyNow(buyNowProduct);
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
  const defaultVariant = Array.isArray(product.variantOptions) && product.variantOptions.length
    ? product.variantOptions[0]
    : null;

  document.title = `${product.name} - Peptide Plug`;

  productPage.innerHTML = `
    ${renderProductImageSection(product)}

    <div class="product-info">
      <h1>${product.name}</h1>
      <p class="product-price" id="productPrice">${defaultVariant ? defaultVariant.price : product.price}</p>

      ${renderVariantSelector(product)}

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
  setupImageSlider(product);
  setupVariantSelector(product);
  setupProductActions(product);
}

document.addEventListener("DOMContentLoaded", renderProductPage);