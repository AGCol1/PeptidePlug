document.addEventListener('DOMContentLoaded', () => {
  const orderItemsContainer = document.getElementById('orderItemsContainer');
  const orderTotalElement = document.getElementById('orderTotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutStatus = document.getElementById('checkoutStatus');

  const basket = window.PP_CART.getBasket();
  const checkoutItem = window.PP_CART.getCheckoutItem();
  const orderItems = basket.length ? basket : checkoutItem ? [checkoutItem] : [];

  if (!orderItems.length) {
    orderItemsContainer.innerHTML = '<p>Your basket is empty. Add one item or use the Buy Now button.</p>';
    return;
  }

  function parsePrice(value) {
    const normalized = String(value ?? '').replace(/[^0-9.\-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  let hasInvalidPrice = false;
  const total = orderItems.reduce((sum, item) => {
    const price = parsePrice(item.price);
    const qty = Number(item.qty) || 0;

    if (price === null || qty <= 0) {
      hasInvalidPrice = true;
      return sum;
    }

    return sum + price * qty;
  }, 0);

  if (hasInvalidPrice || !Number.isFinite(total)) {
    orderItemsContainer.innerHTML = '<p>Unable to calculate order total. Please refresh the page and try again.</p>';
    orderTotalElement.textContent = '£0.00';
    checkoutForm.addEventListener('submit', event => event.preventDefault());
    return;
  }

  orderTotalElement.textContent = `£${total.toFixed(2)}`;

  orderItemsContainer.innerHTML = `
    <ul class="order-items-list">
      ${orderItems.map(item => {
        const itemPrice = parsePrice(item.price) ?? 0;
        return `
        <li>
          <span>${item.name} x ${item.qty}</span>
          <strong>£${itemPrice.toFixed(2)}</strong>
        </li>
      `;
      }).join('')}
    </ul>
  `;

  checkoutForm.addEventListener('submit', async event => {
    event.preventDefault();

    checkoutStatus.textContent = '';
    const form = new FormData(checkoutForm);
    const amount = Number(total.toFixed(2));
    if (!Number.isFinite(amount)) {
      checkoutStatus.textContent = 'Unable to submit order because the total is invalid.';
      return;
    }

    const payload = {
      full_name: form.get('full_name'),
      email: form.get('email'),
      address_line_1: form.get('address_line_1'),
      address_line_2: form.get('address_line_2'),
      city: form.get('city'),
      postcode: form.get('postcode'),
      country: form.get('country'),
      shipping_instructions: form.get('shipping_instructions'),
      amount: amount,
      items: orderItems.map(item => ({
        product_id: item.product_id || null,
        variantId: item.variantId,
        name: item.name,
        qty: item.qty,
        price: Number(String(item.price).replace(/[^0-9.]/g, '')) || 0
      }))
    };

    try {
      const response = await fetch('/api/create-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        checkoutStatus.textContent = result.message || 'Order creation failed.';
        return;
      }

      window.PP_CART.clearBasket();
      window.PP_CART.clearCheckoutItem();

      window.location.href = `/order-success.html?orderRef=${encodeURIComponent(result.orderRef)}&email=${encodeURIComponent(payload.email)}&amount=${encodeURIComponent(result.amount)}`;
    } catch (error) {
      checkoutStatus.textContent = 'Network error. Please try again.';
    }
  });
});
