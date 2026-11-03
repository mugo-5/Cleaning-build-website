(function () {
  'use strict';

  const whatsappNumber = '254722403033';
  const form = document.getElementById('quoteForm');
  const status = document.getElementById('formMessage');

  if (!form || !status) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value.trim();
    const details = document.getElementById('message').value.trim();

    if (!name || !phone || !service) {
      status.textContent = 'Please fill in your name, phone number, and service needed.';
      status.classList.add('show');
      return;
    }

    const whatsappText = [
      "Hello Kim's Sparkle Cleaning Enterprise, I'd like to request a quote.",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      details ? `Project details: ${details}` : ''
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
    const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    status.textContent = whatsappWindow
      ? 'WhatsApp opened with your request. Please tap Send in WhatsApp.'
      : 'Your request is ready. Opening WhatsApp…';
    status.classList.add('show');

    if (!whatsappWindow) {
      window.location.assign(whatsappUrl);
    }

    try {
      const response = await fetch('api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, service, details }),
        keepalive: true,
      });
      const result = await response.json().catch(function () { return {}; });

      if (!response.ok) {
        throw new Error(result.error || 'The server could not save your request.');
      }

      status.textContent = 'Your quote request was saved. WhatsApp is open—please tap Send to message the business.';
      form.reset();
    } catch (error) {
      console.error('Quote API request failed:', error);
      status.textContent = 'WhatsApp is open with your request—please tap Send. The website could not save a copy, so contact us by WhatsApp if needed.';
    }
  }, true);
})();
