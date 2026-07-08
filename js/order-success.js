document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const orderRef = params.get('orderRef');
  const orderEmail = params.get('email');
  const orderAmount = params.get('amount');

  const orderRefElement = document.getElementById('orderRef');
  const orderEmailElement = document.getElementById('orderEmail');
  const orderAmountElement = document.getElementById('orderAmount');
  const confirmPaidBtn = document.getElementById('confirmPaidBtn');
  const payLaterBtn = document.getElementById('payLaterBtn');
  const payLaterInfo = document.getElementById('payLaterInfo');
  const orderStatus = document.getElementById('orderStatus');

  if (!orderRef || !orderEmail) {
    orderStatus.textContent = 'Unable to load order details. Please contact support.';
    return;
  }

  function normalizeAmountValue(value) {
    if (typeof value !== 'string') {
      return Number(value);
    }

    const normalized = value.replace(/,/g, '').trim();
    return Number(normalized);
  }

  const parsedAmount = normalizeAmountValue(orderAmount);
  const amountText = Number.isFinite(parsedAmount) ? `£${parsedAmount.toFixed(2)}` : '£0.00';

  orderRefElement.textContent = orderRef;
  orderEmailElement.textContent = orderEmail;
  orderAmountElement.textContent = amountText;

  if (!Number.isFinite(parsedAmount)) {
    orderStatus.textContent = 'Warning: payment amount could not be loaded correctly.';
  }

  async function updatePaymentStatus(status) {
    orderStatus.textContent = '';

    try {
      const response = await fetch('/api/order-payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ref: orderRef, paid: status })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        orderStatus.textContent = result.message || 'Failed to update payment status.';
        return;
      }

      orderStatus.textContent = `Payment status updated to '${status}'.`;
    } catch (error) {
      orderStatus.textContent = 'Network error. Please try again.';
    }
  }

  confirmPaidBtn.addEventListener('click', () => updatePaymentStatus('true'));
  payLaterBtn.addEventListener('click', () => {
    updatePaymentStatus('pending');
    payLaterInfo.classList.add('open');
  });
});
