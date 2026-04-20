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
    { label: "All Products", href: getShopLink() }
  ];

  const categoryOrder = [
    { key: "peptides", label: "Peptides", dropdown: true },
    { key: "bundles", label: "Bundles & Blends", dropdown: true },
    { key: "lab-supplies", label: "Lab Supplies", dropdown: true }
  ];

  const faqLink = window.location.pathname.toLowerCase().includes("/shop/")
    ? "../faq.html"
    : "/faq.html";

  const productCategories = {};

  window.PRODUCTS.forEach(product => {
    if (!product.category) return;

    if (!productCategories[product.category]) {
      productCategories[product.category] = [];
    }

    productCategories[product.category].push(product);
  });

  let navHTML = "";

  staticLinks.forEach(link => {
    navHTML += `<a href="${link.href}">${link.label}</a>`;
  });

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

  navHTML += `<a href="${faqLink}">FAQ</a>`;

  navHTML += `
  <div class="nav-action-buttons">
    <button class="nav-support-btn" type="button" id="navSupportBtn">Get Support</button>
  </div>
`;

  categoryNav.innerHTML = navHTML;

  const navSupportBtn = document.getElementById("navSupportBtn");
  const supportPanel = document.getElementById("supportPanel");

  if (navSupportBtn && supportPanel) {
    navSupportBtn.addEventListener("click", () => {
      supportPanel.classList.add("open");
    });
  }
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

  document.addEventListener("click", e => {
    const clickedInsideWidget = document.getElementById("supportWidget")?.contains(e.target);
    const clickedNavSupport = document.getElementById("navSupportBtn")?.contains(e.target);

    if (!clickedInsideWidget && !clickedNavSupport) {
      supportPanel.classList.remove("open");
    }
  });

  supportForm.addEventListener("submit", async e => {
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

function renderFooter() {
  const footerTarget = document.getElementById("siteFooter");
  if (!footerTarget) return;

footerTarget.innerHTML = `
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-column footer-brand">
        <h3>Peptide Plug</h3>
        <p>
          Products supplied via this website are intended strictly for laboratory
          research purposes only. They are not intended for human or animal use.
        </p>

        <div class="footer-contact-block">
          <p><strong>Email Address</strong><br>support@peptideplug.co.uk</p>
        </div>
      </div>

      <div class="footer-column">
        <h4>About Peptide Plug</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/shop/">Shop</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Customer Service</h4>
        <ul>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Research Categories</h4>
        <ul>
        </ul>
      </div>
    </div>

    <div class="footer-disclaimer">
      <p>
        Disclaimer: The information provided on this website is for general informational
        and research reference purposes only. Nothing contained on this website constitutes,
        or should be interpreted as, medical advice, healthcare advice, diagnosis, treatment,
        or any representation regarding the safety or suitability of any product for personal use.
        All products listed are supplied strictly for laboratory research purposes only and are
        not intended for human consumption, veterinary use, therapeutic use, diagnostic use,
        or administration of any kind. By accessing this website and purchasing from it, you
        accept full responsibility for ensuring that your use of the website, and any products
        obtained through it, complies with all applicable laws, regulations, and restrictions
        in your jurisdiction.
      </p>
    </div>
  </footer>
`;

}

document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
});