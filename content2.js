function parseCurrency(str) {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function calculateMonthlyDebt(principal, annualRate = 0.10, years = 10) {
  const r = annualRate / 12;
  const n = years * 12;
  return principal * (r / (1 - Math.pow(1 + r, -n)));
}

function injectMetrics() {
  console.log('Injecting metrics...');
  const listings = document.querySelectorAll('.search-result-card');
  console.log('Found listings:', listings.length);

  listings.forEach(listing => {
    // Avoid injecting twice
    if (listing.querySelector('.dscr-injected')) return;

    const priceEl = listing.querySelector('[data-label="Asking Price"]');
    const cashFlowEl = listing.querySelector('[data-label="Cash Flow"]');
    console.log('Listing:', { priceEl, cashFlowEl });

    if (!priceEl || !cashFlowEl) return;

    const askingPrice = parseCurrency(priceEl.textContent);
    const cashFlow = parseCurrency(cashFlowEl.textContent);

    if (!askingPrice || !cashFlow) return;

    const monthlyDebt = calculateMonthlyDebt(askingPrice);
    const annualDebt = monthlyDebt * 12;
    const dscr = cashFlow / annualDebt;
    const netMonthly = (cashFlow / 12) - monthlyDebt;

    const info = document.createElement('div');
    info.className = 'dscr-injected';
    info.style.marginTop = '6px';
    info.style.fontSize = '13px';
    info.style.fontWeight = 'bold';
    info.style.color = dscr < 1.0 ? 'red' : 'green';
    info.innerHTML = `
      📊 DSCR: ${dscr.toFixed(2)}<br>
      💸 Net/Month: $${netMonthly.toFixed(0)}
    `;

    // Append under cash flow section
    cashFlowEl.parentElement.appendChild(info);
  });
}

// Re-run if listings update dynamically
const observer = new MutationObserver(() => {
  injectMetrics();
  console.log('BizBuySell DSCR extension loaded');
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also try once initially in case listings are already loaded
window.addEventListener('load', injectMetrics);
