const products = [
  {
    id: 1,
    name: 'CJC-1295',
    category: 'Peptides',
    price: 98,
    stock: 'In stock',
    description: 'Supports recovery and lean mass.',
  },
  {
    id: 2,
    name: 'BPC-157',
    category: 'Peptides',
    price: 79,
    stock: 'Low stock',
    description: 'Promotes joint and tendon repair.',
  },
  {
    id: 3,
    name: 'Peptide Serum',
    category: 'Skincare',
    price: 45,
    stock: 'Out of stock',
    description: 'Hydrating peptide blend.',
  },
];

const orders = [
  {
    id: 101,
    customer: 'Ashley King',
    total: 188.5,
    status: 'Pending',
    placed: 'June 3, 2026',
    address: '202 Woodlane Ave, Suite 4, Phoenix, AZ 85001',
    items: [
      { product: 'CJC-1295', quantity: 2 },
      { product: 'BPC-157', quantity: 1 },
    ],
    notes: 'Leave at the front desk if no answer.',
  },
  {
    id: 102,
    customer: 'Evan Park',
    total: 45.0,
    status: 'Pending',
    placed: 'June 4, 2026',
    address: '14 Maple Street, Apt 6B, Seattle, WA 98101',
    items: [
      { product: 'Peptide Serum', quantity: 1 },
    ],
    notes: 'Call before delivery.',
  },
  {
    id: 103,
    customer: 'Mia Lopez',
    total: 260.0,
    status: 'Completed',
    placed: 'June 2, 2026',
    address: '538 Lakeview Rd, Orlando, FL 32801',
    items: [
      { product: 'CJC-1295', quantity: 1 },
      { product: 'Peptide Serum', quantity: 2 },
    ],
    notes: 'Gift wrap requested.',
  },
];

let editingProductId = null;
let selectedOrderId = null;
const productFormBanner = document.getElementById('product-form-banner');
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const cancelEditButton = document.getElementById('cancel-edit');
const toast = document.getElementById('toast');
const orderDetailsPanel = document.getElementById('order-details');
const orderDetailsContent = document.getElementById('order-details-content');
const orderDetailsTitle = document.getElementById('order-details-title');

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function statusClass(status) {
  if (status === 'In stock') return 'status-instock';
  if (status === 'Low stock') return 'status-low';
  return 'status-out';
}

function orderStatusClass(status) {
  if (status === 'Completed') return 'order-status-completed';
  if (status === 'Pending') return 'order-status-pending';
  return 'order-status-canceled';
}

function renderSummary() {
  document.getElementById('total-products').textContent = products.length;
  document.getElementById('total-stock').textContent = products.filter((product) => product.stock === 'In stock').length;
  document.getElementById('pending-listings').textContent = products.filter((product) => product.stock === 'Low stock').length;
}

function renderOrderSummary() {
  document.getElementById('order-total').textContent = orders.length;
  document.getElementById('order-pending').textContent = orders.filter((order) => order.status === 'Pending').length;
  document.getElementById('order-completed').textContent = orders.filter((order) => order.status === 'Completed').length;
}

function renderProducts() {
  const tbody = document.querySelector('#product-table tbody');
  tbody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${formatCurrency(product.price)}</td>
          <td><span class="status-badge ${statusClass(product.stock)}">${product.stock}</span></td>
          <td>${product.description || '—'}</td>
          <td>
            <div class="product-actions">
              <button class="button-secondary" type="button" onclick="editProduct(${product.id})">Edit</button>
              <button class="button-secondary" type="button" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
  renderSummary();
}

function renderOrders() {
  const tbody = document.querySelector('#orders-table tbody');
  tbody.innerHTML = orders
    .map(
      (order) => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.customer}</td>
          <td>${formatCurrency(order.total)}</td>
          <td><span class="order-status ${orderStatusClass(order.status)}">${order.status}</span></td>
          <td>
            <div class="product-actions">
              <button class="button-secondary" type="button" onclick="viewOrder(${order.id})">View</button>
              <button class="button-secondary" type="button" onclick="completeOrder(${order.id})">${order.status === 'Completed' ? 'Completed' : 'Mark complete'}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

function showProductForm() {
  editingProductId = null;
  productForm.reset();
  formTitle.textContent = 'Add product';
  productForm.querySelector('button[type="submit"]').textContent = 'Save product';
  cancelEditButton.classList.add('hidden');
  productFormBanner.classList.remove('hidden');
  window.scrollTo({ top: productFormBanner.offsetTop - 20, behavior: 'smooth' });
}

function hideProductForm() {
  editingProductId = null;
  productForm.reset();
  productFormBanner.classList.add('hidden');
  cancelEditButton.classList.add('hidden');
}

function fillForm(product) {
  editingProductId = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-stock').value = product.stock;
  document.getElementById('product-description').value = product.description;
  formTitle.textContent = 'Edit product';
  productForm.querySelector('button[type="submit"]').textContent = 'Update product';
  cancelEditButton.classList.remove('hidden');
  productFormBanner.classList.remove('hidden');
  window.scrollTo({ top: productFormBanner.offsetTop - 20, behavior: 'smooth' });
}

function showMessage(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  window.clearTimeout(toast.dismissTimeout);
  toast.dismissTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2200);
}

function getFormValues() {
  return {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value.trim(),
    price: parseFloat(document.getElementById('product-price').value) || 0,
    stock: document.getElementById('product-stock').value,
    description: document.getElementById('product-description').value.trim(),
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const values = getFormValues();
  if (!values.name || !values.category || values.price <= 0) {
    showMessage('Please complete the name, category, and price fields.');
    return;
  }

  if (editingProductId) {
    const index = products.findIndex((product) => product.id === editingProductId);
    if (index !== -1) {
      products[index] = { id: editingProductId, ...values };
      showMessage('Product updated successfully.');
    }
  } else {
    const nextId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1;
    products.push({ id: nextId, ...values });
    showMessage('Product added to the catalog.');
  }

  hideProductForm();
  renderProducts();
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (product) {
    fillForm(product);
  }
}

function deleteProduct(id) {
  const index = products.findIndex((product) => product.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    if (editingProductId === id) {
      hideProductForm();
    }
    renderProducts();
    showMessage('Product removed.');
  }
}

function completeOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (order && order.status !== 'Completed') {
    order.status = 'Completed';
    renderOrders();
    renderOrderSummary();
    showMessage('Order marked complete.');
    if (!orderDetailsPanel.classList.contains('hidden') && selectedOrderId === id) {
      viewOrder(id);
    }
  }
}

function viewOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) {
    return;
  }

  selectedOrderId = id;
  orderDetailsPanel.classList.remove('hidden');
  orderDetailsTitle.textContent = `#${order.id} • ${order.customer}`;

  const itemsHtml = order.items
    .map(
      (item) => `
        <li class="order-detail-item">
          <strong>${item.product}</strong>
          <span>Quantity: ${item.quantity}</span>
        </li>
      `
    )
    .join('');

  orderDetailsContent.innerHTML = `
    <div class="order-detail-row">
      <strong>Order placed</strong>
      <p>${order.placed}</p>
    </div>
    <div class="order-detail-row">
      <strong>Shipping address</strong>
      <p>${order.address}</p>
    </div>
    <div class="order-detail-row">
      <strong>Order total</strong>
      <p>${formatCurrency(order.total)}</p>
    </div>
    <div class="order-detail-row">
      <strong>Notes</strong>
      <p>${order.notes}</p>
    </div>
    <div class="order-detail-row">
      <strong>Items</strong>
      <ul class="order-detail-items">
        ${itemsHtml}
      </ul>
    </div>
  `;

  window.scrollTo({ top: orderDetailsPanel.offsetTop - 20, behavior: 'smooth' });
}

function closeOrderDetails() {
  orderDetailsPanel.classList.add('hidden');
}

function refreshMetrics() {
  renderSummary();
  renderOrderSummary();
  showMessage('Metrics refreshed.');
}

document.addEventListener('DOMContentLoaded', () => {
  productForm.addEventListener('submit', handleFormSubmit);
  cancelEditButton.addEventListener('click', hideProductForm);
  renderProducts();
  renderOrders();
  renderOrderSummary();
});
