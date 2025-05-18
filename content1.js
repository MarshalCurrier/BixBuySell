function parseNumber(str) {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function calculateMonthlyDebtPayment(loanAmount, annualRate = 0.10, years = 10) {
  const monthlyRate = annualRate / 12;
  const n = years * 12;
  return loanAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -n)));
}

function enhanceBizBuySellSearch() {
  const listings = document.querySelectorAll('.listing-card');

  listings.forEach(card => {
    const priceEl = card.querySelector('[data-label="Asking Price"]');
    const cashFlowEl = card.querySelector('[data-label="Cash Flow"]');
    const targetInsertEl = card.querySelector('.ng-star-inserted');

    if (!priceEl || !cashFlowEl || !targetInsertEl) return;

    const askingPrice = parseNumber(priceEl.textContent);
    const annualCashFlow = parseNumber(cashFlowEl.textContent);

    if (!askingPrice || !annualCashFlow) return;

    const loanAmount = askingPrice; // 0% down
    const monthlyDebtPayment = calculateMonthlyDebtPayment(loanAmount);
    const dscr = annualCashFlow / (monthlyDebtPayment * 12);
    const monthlyIncomeAfterDebt = (annualCashFlow / 12) - monthlyDebtPayment;

    const infoBox = document.createElement('div');
    infoBox.className = 'financial-metrics';
    infoBox.style.marginTop = '4px';
    infoBox.style.fontSize = '13px';
    infoBox.style.color = dscr < 1.0 ? 'red' : 'green';
    infoBox.innerHTML = `
      <div>📊 DSCR: ${dscr.toFixed(2)}</div>
      <div>💸 Net/Month: $${monthlyIncomeAfterDebt.toFixed(0)}</div>
    `;

    targetInsertEl.appendChild(infoBox);
  });
}

// Handle dynamic loading
const observer = new MutationObserver(() => {
  if (document.querySelector('.listing-card')) {
    enhanceBizBuySellSearch();
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
