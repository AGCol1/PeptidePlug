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

document.addEventListener("DOMContentLoaded", () => {
  const supportToggle = document.getElementById("supportToggle");
  const supportPanel = document.getElementById("supportPanel");
  const supportClose = document.getElementById("supportClose");
  const supportForm = document.getElementById("supportForm");
  const supportStatus = document.getElementById("supportStatus");

  if (!supportToggle || !supportPanel || !supportClose || !supportForm || !supportStatus) {
    return;
  }

  supportToggle.addEventListener("click", () => {
    supportPanel.classList.add("open");
  });

  supportClose.addEventListener("click", () => {
    supportPanel.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    const clickedInsideWidget = document.getElementById("supportWidget")?.contains(e.target);

    if (!clickedInsideWidget) {
      supportPanel.classList.remove("open");
    }
  });

  supportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(supportForm);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      page: window.location.pathname + window.location.search
    };

    supportStatus.textContent = "Sending...";

    try {
      const response = await fetch("/support.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        supportStatus.textContent = "Message sent successfully.";
        supportForm.reset();
        setTimeout(() => {
          supportPanel.classList.remove("open");
          supportStatus.textContent = "";
        }, 1500);
      } else {
        supportStatus.textContent = result.message || "Something went wrong.";
      }
    } catch (error) {
      supportStatus.textContent = "Network error. Please try again.";
    }
  });
});