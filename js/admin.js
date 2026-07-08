document.addEventListener('DOMContentLoaded', () => {
  const adminOrdersBody = document.getElementById('adminOrdersBody');
  const adminStatus = document.getElementById('adminStatus');
  const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
  const statusFilter = document.getElementById('statusFilter');

  async function fetchOrders() {
    adminStatus.textContent = 'Loading orders...';

    try {
      const response = await fetch('/api/admin-orders.php');
      const result = await response.json();

      if (!response.ok || !result.success) {
        adminStatus.textContent = result.message || 'Failed to load orders.';
        return [];
      }

      adminStatus.textContent = '';
      return result.orders || [];
    } catch (error) {
      adminStatus.textContent = 'Network error loading orders.';
      return [];
    }
  }

  function getStatusLabel(status) {
    if (status === 'true') return 'Paid';
    if (status === 'pending') return 'Pending';
    return 'Unpaid';
  }

  function getStatusClass(status) {
    if (status === 'true') return 'status-true';
    if (status === 'pending') return 'status-pending';
    return 'status-false';
  }

  function renderOrderItems(order) {
    return `
      <div>
        <p><strong>Shipping Address:</strong> ${order.address_line_1}${order.address_line_2 ? ', ' + order.address_line_2 : ''}, ${order.city}, ${order.postcode}, ${order.country}</p>
        <p><strong>Shipping Notes:</strong> ${order.shipping_instructions || 'None'}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${order.items.map(item => `<li>${item.product_name} x ${item.quantity} @ £${Number(String(item.price).replace(/[^0-9.]/g, '')).toFixed(2)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderOrders(orders) {
    const filterValue = statusFilter.value;
    const filteredOrders = filterValue === 'all' ? orders : orders.filter(order => order.paid === filterValue);

    adminOrdersBody.innerHTML = filteredOrders.map(order => {
      return `
        <tr>
          <td data-label="ID">${order.id}</td>
          <td data-label="Order Ref">${order.order_ref}</td>
          <td data-label="Name">${order.full_name}</td>
          <td data-label="Email">${order.email}</td>
          <td data-label="Amount">£${Number(order.amount).toFixed(2)}</td>
          <td data-label="Paid"><span class="status-badge ${getStatusClass(order.paid)}">${getStatusLabel(order.paid)}</span></td>
          <td data-label="Date">${order.created_at}</td>
          <td data-label="Actions">
            <button class="btn secondary" data-action="true" data-ref="${order.order_ref}">Paid</button>
            <button class="btn secondary" data-action="pending" data-ref="${order.order_ref}">Pending</button>
            <button class="btn secondary" data-action="false" data-ref="${order.order_ref}">Unpaid</button>
            <button class="btn" data-toggle-details="${order.order_ref}">View</button>
          </td>
        </tr>
        <tr class="hidden-row" data-details="${order.order_ref}">
          <td colspan="8">
            <div>
              <p><strong>Order Reference:</strong> ${order.order_ref}</p>
              <p><strong>Email:</strong> ${order.email}</p>
              <p><strong>Address:</strong> ${order.address_line_1}${order.address_line_2 ? ', ' + order.address_line_2 : ''}, ${order.city}, ${order.postcode}, ${order.country}</p>
              <p><strong>Shipping Instructions:</strong> ${order.shipping_instructions || 'None'}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${order.items.map(item => `<li>${item.product_name} x ${item.quantity} @ £${Number(String(item.price).replace(/[^0-9.]/g, '')).toFixed(2)}</li>`).join('')}
              </ul>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachOrderActionHandlers();
  }

  function attachOrderActionHandlers() {
    adminOrdersBody.querySelectorAll('button[data-action]').forEach(button => {
      button.addEventListener('click', async () => {
        const orderRef = button.dataset.ref;
        const paid = button.dataset.action;
        await updatePaymentStatus(orderRef, paid);
      });
    });

    adminOrdersBody.querySelectorAll('button[data-toggle-details]').forEach(button => {
      button.addEventListener('click', () => {
        const detailsRow = document.querySelector(`tr[data-details="${button.dataset.toggleDetails}"]`);
        if (detailsRow) {
          detailsRow.classList.toggle('hidden-row');
        }
      });
    });
  }

  async function updatePaymentStatus(orderRef, paid) {
    adminStatus.textContent = 'Updating payment status...';

    try {
      const response = await fetch('/api/order-payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ref: orderRef, paid })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        adminStatus.textContent = result.message || 'Failed to update payment status.';
        return;
      }

      adminStatus.textContent = `Order ${orderRef} updated to ${paid}.`;
      loadOrders();
    } catch (error) {
      adminStatus.textContent = 'Network error updating payment status.';
    }
  }

  async function loadOrders() {
    const orders = await fetchOrders();
    renderOrders(orders);
  }

  /* Product management */
  const productForm = document.getElementById('productForm');
  const productsBody = document.getElementById('productsBody');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const resetProductBtn = document.getElementById('resetProductBtn');

  async function fetchProducts() {
    try {
      const resp = await fetch('/api/admin-products.php');
      const j = await resp.json();
      if (!resp.ok || !j.success) return [];
      return j.products || [];
    } catch (e) {
      return [];
    }
  }

  function renderProducts(products) {
    productsBody.innerHTML = products.map(p => `
      <tr>
        <td data-label="ID">${p.id}</td>
        <td data-label="Name">${p.name}</td>
        <td data-label="Price">£${Number(p.price).toFixed(2)}</td>
        <td data-label="Active">${p.active == 1 ? 'Yes' : 'No'}</td>
        <td data-label="Actions">
          <button class="btn secondary" data-edit="${p.id}">Edit</button>
          <button class="btn" data-delete="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    attachProductHandlers();
  }

  function attachProductHandlers() {
    productsBody.querySelectorAll('button[data-edit]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.edit;
        const resp = await fetch('/api/admin-products.php');
        const j = await resp.json();
        const prod = (j.products || []).find(x => String(x.id) === String(id));
        if (!prod) return;
        // populate form
        document.getElementById('productId').value = prod.id;
        document.getElementById('productName').value = prod.name;
        document.getElementById('productSlug').value = prod.slug;
        document.getElementById('productPrice').value = prod.price;
        // stock removed; use active flag instead
        document.getElementById('productCategory').value = prod.category;
        document.getElementById('productShort').value = prod.short_description;
        document.getElementById('productImage').value = prod.image;
        document.getElementById('productActive').checked = prod.active == 1;
      });
    });

    productsBody.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this product?')) return;
        const id = btn.dataset.delete;
        await fetch('/api/admin-products.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        loadProducts();
      });
    });
  }

  async function saveProduct() {
    const id = document.getElementById('productId').value;
    const productFormElement = document.getElementById('productForm');
    const formData = new FormData(productFormElement);
    formData.set('active', document.getElementById('productActive').checked ? 1 : 0);

    if (id) {
      formData.set('id', id);
    }

    // show progress
    const statusEl = document.getElementById('adminStatus');
    if (statusEl) statusEl.textContent = 'Saving product...';

    try {
      const resp = await fetch('/api/admin-products.php', {
        method: 'POST',
        body: formData
      });
      const j = await resp.json().catch(() => null);

      if (!resp.ok || !j || !j.success) {
        if (statusEl) statusEl.textContent = j && j.message ? j.message : 'Failed to save product.';
        return;
      }

      if (statusEl) statusEl.textContent = 'Product saved.';
      resetProductForm();
      loadProducts();
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Network error saving product.';
    }
  }

  function resetProductForm() {
    document.getElementById('productId').value = '';
    productForm.reset();
    document.getElementById('productImageFile').value = '';
  }

  async function loadProducts() {
    const prods = await fetchProducts();
    renderProducts(prods);
  }

  saveProductBtn.addEventListener('click', saveProduct);
  resetProductBtn.addEventListener('click', resetProductForm);

  // File input behavior: validate and toggle URL input + preview
  const productImageFile = document.getElementById('productImageFile');
  const productImageInput = document.getElementById('productImage');
  const productImagePreview = document.getElementById('productImagePreview');
  const productImageInfo = document.getElementById('productImageInfo');
  const MAX_BYTES = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp'];

  if (productImageFile) {
    productImageFile.addEventListener('change', (e) => {
      const statusEl = document.getElementById('adminStatus');
      const file = e.target.files && e.target.files[0];
      if (!file) {
        // no file selected -> restore URL input
        productImageInput.disabled = false;
        if (productImagePreview) {
          productImagePreview.style.display = 'none';
          productImagePreview.src = '';
        }
        if (statusEl) statusEl.textContent = '';
        return;
      }

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        if (statusEl) statusEl.textContent = 'Invalid file type. Use jpg/jpeg/png/gif/webp.';
        productImageFile.value = '';
        return;
      }

      // Validate size
      if (file.size > MAX_BYTES) {
        if (statusEl) statusEl.textContent = 'File too large. Max 2MB.';
        productImageFile.value = '';
        return;
      }

      // Valid file: hide/disable URL input and show preview
      productImageInput.disabled = true;
      if (productImagePreview) {
        try {
          const url = URL.createObjectURL(file);
          productImagePreview.src = url;
          productImagePreview.style.display = '';
        } catch (err) {
          productImagePreview.style.display = 'none';
        }
      }
      if (statusEl) statusEl.textContent = `Selected file: ${file.name}`;
    });
  }

  // Load products on admin page load
  loadProducts();

  refreshOrdersBtn.addEventListener('click', loadOrders);
  statusFilter.addEventListener('change', loadOrders);

  loadOrders();
});
