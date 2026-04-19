const BASKET_STORAGE_KEY = "peptidePlugBasket";
const FREE_SHIPPING_THRESHOLD = 100;

function isProductOutOfStock(product) {
  if (!product) return true;

  const value = product.availability;

  return (
    value === false ||
    value === "false" ||
    value === "Out of Stock" ||
    value === "out of stock"
  );
}

function getBasket() {
  try {
    const basket = JSON.parse(localStorage.getItem(BASKET_STORAGE_KEY));
    return Array.isArray(basket) ? basket : [];
  } catch (error) {
    return [];
  }
}

function saveBasket(basket) {
  localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  updateBasketCount();
  renderBasketDrawer();
}

function addToBasket(product, qty = 1) {
  if (!product || !product.variantId || isProductOutOfStock(product)) return;

  const basket = getBasket();
  const existingItem = basket.find(item => item.variantId === product.variantId);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    basket.push({
      variantId: product.variantId,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty,
      selectedOptionLabel: product.selectedOptionLabel || ""
    });
  }

  saveBasket(basket);
}

function updateBasketItemQty(variantId, qty) {
  let basket = getBasket();

  basket = basket
    .map(item => {
      if (item.variantId === variantId) {
        return { ...item, qty: qty };
      }
      return item;
    })
    .filter(item => item.qty > 0);

  saveBasket(basket);
}

function removeFromBasket(variantId) {
  const basket = getBasket().filter(item => item.variantId !== variantId);
  saveBasket(basket);
}

function clearBasket() {
  saveBasket([]);
}

function getBasketCount() {
  return getBasket().reduce((total, item) => total + item.qty, 0);
}

function getBasketTotal() {
  return getBasket().reduce((total, item) => {
    const numericPrice = Number(String(item.price).replace(/[^0-9.]/g, ""));
    return total + numericPrice * item.qty;
  }, 0);
}

function buildShopifyCartUrl(items) {
  if (!window.SITE_CONFIG || !window.SITE_CONFIG.shopifyDomain) {
    return "#";
  }

  if (!items || !items.length) {
    return `https://${window.SITE_CONFIG.shopifyDomain}/cart`;
  }

  const cartPath = items.map(item => `${item.variantId}:${item.qty}`).join(",");
  return `https://${window.SITE_CONFIG.shopifyDomain}/cart/${cartPath}`;
}

function goToBasketCheckout() {
  const basket = getBasket();

  if (!basket.length) {
    alert("Your basket is empty.");
    return;
  }

  window.location.href = buildShopifyCartUrl(basket);
}

function buyNow(product) {
  if (!product || !product.variantId || isProductOutOfStock(product)) return;
  window.location.href = buildShopifyCartUrl([{ variantId: product.variantId, qty: 1 }]);
}

function formatPrice(value) {
  return `£${value.toFixed(2)}`;
}

function getFreeShippingMessage(total) {
  if (total >= FREE_SHIPPING_THRESHOLD) {
    return "You qualify for free shipping.";
  }

  const remaining = FREE_SHIPPING_THRESHOLD - total;
  return `Spend ${formatPrice(remaining)} more to qualify for free shipping.`;
}

function ensureBasketUI() {
  if (document.getElementById("basketDrawer")) return;

  const basketUI = document.createElement("div");
  basketUI.innerHTML = `
    <button id="basketLauncher" class="basket-launcher" type="button" aria-label="Open basket">
      Basket <span id="basketCount" class="basket-count">0</span>
    </button>

    <div id="basketOverlay" class="basket-overlay"></div>

    <aside id="basketDrawer" class="basket-drawer" aria-hidden="true">
      <div class="basket-drawer-header">
        <h3>Your Basket</h3>
        <button id="basketCloseBtn" class="basket-close-btn" type="button" aria-label="Close basket">&times;</button>
      </div>

      <div id="basketItems" class="basket-items"></div>

      <div class="basket-footer">
        <p class="basket-total">Total: <span id="basketTotal">£0.00</span></p>
        <p id="freeShippingMessage" class="free-shipping-message"></p>
        <div class="basket-actions">
          <button id="basketClearBtn" class="btn secondary" type="button">Clear</button>
          <button id="basketCheckoutBtn" class="btn" type="button">Checkout</button>
        </div>
      </div>
    </aside>
  `;

  document.body.appendChild(basketUI);

  const basketLauncher = document.getElementById("basketLauncher");
  const basketOverlay = document.getElementById("basketOverlay");
  const basketCloseBtn = document.getElementById("basketCloseBtn");
  const basketClearBtn = document.getElementById("basketClearBtn");
  const basketCheckoutBtn = document.getElementById("basketCheckoutBtn");

  if (basketLauncher) {
    basketLauncher.addEventListener("click", openBasketDrawer);
  }

  if (basketOverlay) {
    basketOverlay.addEventListener("click", closeBasketDrawer);
  }

  if (basketCloseBtn) {
    basketCloseBtn.addEventListener("click", closeBasketDrawer);
  }

  if (basketClearBtn) {
    basketClearBtn.addEventListener("click", clearBasket);
  }

  if (basketCheckoutBtn) {
    basketCheckoutBtn.addEventListener("click", goToBasketCheckout);
  }
}

function openBasketDrawer() {
  const basketDrawer = document.getElementById("basketDrawer");
  const basketOverlay = document.getElementById("basketOverlay");
  const supportWidget = document.getElementById("supportWidget");
  const basketLauncher = document.getElementById("basketLauncher");

  if (basketDrawer) {
    basketDrawer.classList.add("open");
    basketDrawer.setAttribute("aria-hidden", "false");
  }

  if (basketOverlay) {
    basketOverlay.classList.add("open");
  }

  if (supportWidget) {
    supportWidget.classList.add("hidden-by-basket");
  }

  if (basketLauncher) {
    basketLauncher.classList.add("hidden-by-basket");
  }
}

function closeBasketDrawer() {
  const basketDrawer = document.getElementById("basketDrawer");
  const basketOverlay = document.getElementById("basketOverlay");
  const supportWidget = document.getElementById("supportWidget");
  const basketLauncher = document.getElementById("basketLauncher");

  if (basketDrawer) {
    basketDrawer.classList.remove("open");
    basketDrawer.setAttribute("aria-hidden", "true");
  }

  if (basketOverlay) {
    basketOverlay.classList.remove("open");
  }

  if (supportWidget) {
    supportWidget.classList.remove("hidden-by-basket");
  }

  if (basketLauncher) {
    basketLauncher.classList.remove("hidden-by-basket");
  }
}

function renderBasketDrawer() {
  const basketItemsWrap = document.getElementById("basketItems");
  const basketTotal = document.getElementById("basketTotal");
  const freeShippingMessage = document.getElementById("freeShippingMessage");

  if (!basketItemsWrap || !basketTotal || !freeShippingMessage) return;

  const basket = getBasket();
  const total = getBasketTotal();

  if (!basket.length) {
    basketItemsWrap.innerHTML = `<p class="basket-empty">Your basket is empty.</p>`;
    basketTotal.textContent = "£0.00";
    freeShippingMessage.textContent = `Spend ${formatPrice(FREE_SHIPPING_THRESHOLD)} more to qualify for free shipping.`;
    freeShippingMessage.classList.remove("qualified");
    return;
  }

  basketItemsWrap.innerHTML = basket.map(item => {
    const selectedOptionHTML = item.selectedOptionLabel
      ? `<p class="basket-item-option">${item.selectedOptionLabel}</p>`
      : "";

    return `
      <div class="basket-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="basket-item-info">
          <h4>${item.name}</h4>
          ${selectedOptionHTML}
          <p>${item.price}</p>
          <div class="basket-item-controls">
            <button type="button" class="basket-qty-btn" data-action="decrease" data-variant-id="${item.variantId}">-</button>
            <span>${item.qty}</span>
            <button type="button" class="basket-qty-btn" data-action="increase" data-variant-id="${item.variantId}">+</button>
            <button type="button" class="basket-remove-btn" data-variant-id="${item.variantId}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  basketTotal.textContent = formatPrice(total);
  freeShippingMessage.textContent = getFreeShippingMessage(total);

  if (total >= FREE_SHIPPING_THRESHOLD) {
    freeShippingMessage.classList.add("qualified");
  } else {
    freeShippingMessage.classList.remove("qualified");
  }

  basketItemsWrap.querySelectorAll(".basket-qty-btn").forEach(button => {
    button.addEventListener("click", () => {
      const variantId = button.getAttribute("data-variant-id");
      const action = button.getAttribute("data-action");
      const basketItem = getBasket().find(item => item.variantId === variantId);

      if (!basketItem) return;

      if (action === "increase") {
        updateBasketItemQty(variantId, basketItem.qty + 1);
      }

      if (action === "decrease") {
        updateBasketItemQty(variantId, basketItem.qty - 1);
      }
    });
  });

  basketItemsWrap.querySelectorAll(".basket-remove-btn").forEach(button => {
    button.addEventListener("click", () => {
      const variantId = button.getAttribute("data-variant-id");
      removeFromBasket(variantId);
    });
  });
}

function updateBasketCount() {
  const basketCount = document.getElementById("basketCount");
  if (!basketCount) return;
  basketCount.textContent = getBasketCount();
}

document.addEventListener("DOMContentLoaded", () => {
  ensureBasketUI();
  renderBasketDrawer();
  updateBasketCount();
});

window.openBasketDrawer = openBasketDrawer;
window.closeBasketDrawer = closeBasketDrawer;

window.PP_CART = {
  getBasket,
  addToBasket,
  removeFromBasket,
  clearBasket,
  buyNow,
  goToBasketCheckout,
  buildShopifyCartUrl,
  isProductOutOfStock,
  getBasketCount
};