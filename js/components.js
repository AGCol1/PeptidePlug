function renderAnnouncementBar() {
  if (!window.SITE_CONFIG || !window.SITE_CONFIG.announcementText) return;

  const existingBar = document.querySelector(".announcement-bar");
  if (existingBar) return;

  const bar = document.createElement("div");
  bar.className = "announcement-bar";
  bar.textContent = window.SITE_CONFIG.announcementText;

  document.body.prepend(bar);
  document.body.classList.add("has-announcement");
}

function getShopRoot() {
  const path = window.location.pathname.toLowerCase();
  return path.includes("/shop/") ? "./" : "/shop/";
}

function getProductLink(slug) {
  return `${getShopRoot()}product.html?slug=${encodeURIComponent(slug)}`;
}

function getShopLink(category = "") {
  const base = getShopRoot();
  return category ? `${base}?category=${encodeURIComponent(category)}` : base;
}

document.addEventListener("DOMContentLoaded", renderAnnouncementBar);

document.addEventListener("DOMContentLoaded", () => {
  const categoryNav = document.getElementById("categoryNav");

  if (!categoryNav || !window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
    return;
  }

  const staticLinks = [
    { label: "All Products", href: getShopLink() },
    { label: "Reconstitution Guide", href: "/reconstitution-guide.html" }
  ];

  const categoryOrder = [
    { key: "peptides", label: "Peptides", dropdown: true },
    { key: "bundles", label: "Bundles & Blends", dropdown: true },
    { key: "nasal-sprays", label: "Nasal Sprays", dropdown: true },
    { key: "lab-supplies", label: "Lab Supplies", dropdown: true }
  ];

  const productCategories = {};

  window.PRODUCTS.forEach(product => {
    if (!product.category) return;

    if (!productCategories[product.category]) {
      productCategories[product.category] = [];
    }

    productCategories[product.category].push(product);
  });

  let navHTML = "";

  navHTML += `<a href="${staticLinks[0].href}">${staticLinks[0].label}</a>`;

  categoryOrder.forEach(category => {
    const items = productCategories[category.key] || [];

    if (category.dropdown) {
      const dropdownItems = items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(product => `<a href="${getProductLink(product.slug)}">${product.name}</a>`)
        .join("");

      navHTML += `
        <div class="dropdown">
          <button class="dropdown-btn" type="button">
            ${category.label}
            <span class="arrow">▾</span>
          </button>
          <div class="dropdown-menu">
            ${dropdownItems || `<span class="dropdown-empty">No products yet</span>`}
          </div>
        </div>
      `;
    } else {
      navHTML += `<a href="${getShopLink(category.key)}">${category.label}</a>`;
    }
  });

  navHTML += `<a href="${staticLinks[1].href}">${staticLinks[1].label}</a>`;

  categoryNav.innerHTML = navHTML;
});