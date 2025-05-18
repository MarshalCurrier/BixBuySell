// ========= DSCR Extension Debug Logging =========
function log(...args) {
  console.log("[DSCR Extension]", ...args);
}

// ========= Utility: Parse Currency String to Float =========
function parseCurrency(str) {
  const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  log(`Parsed currency "${str}" =>`, num);
  return num;
}

// ========= Financial Calculation: Monthly Debt Service =========
function calculateMonthlyDebt(principal, annualRate = 0.10, years = 10) {
//   const r = annualRate / 12;
//   const n = years * 12;
  const payment = (principal * annualRate * years)/120;
  log(`Monthly debt for $${principal} at ${annualRate * 100}% over ${years} years: $${payment.toFixed(2)}`);
  return payment;
}

// ========= Listing Discovery: Target Listings Dynamically =========
function findListings() {
  // Include multiple potential listing container classes
  const candidates = document.querySelectorAll(
    '.search-result-card, .card-listing, .ng-star-inserted'
  );

  log(`Found ${candidates.length} possible listing containers`);

  const validListings = Array.from(candidates).filter(el =>
    // el.querySelector('[data-label="Asking Price"]') &&
    // el.querySelector('[data-label="Cash Flow"]')
    el.querySelector('.asking-price') &&
    el.querySelector('.cash-flow')
  );

  log(`Validated ${validListings.length} listings with both Asking Price and Cash Flow`);
  return validListings;
}

// ========= Metrics Injection into Listings =========
function injectMetrics() {
  const listings = findListings();
  log(`Injecting metrics into ${listings.length} listings...`);

  listings.forEach((listing, index) => {
    if (listing.querySelector('.dscr-injected')) {
      log(`Listing ${index + 1}: Already injected, skipping.`);
      return;
    }

    // const priceEl = listing.querySelector('[data-label="Asking Price"]');
    // const cashFlowEl = listing.querySelector('[data-label="Cash Flow"]');

    const priceEl = listing.querySelector('.asking-price');
    const cashFlowEl = listing.querySelector('.cash-flow');

    const askingPrice = parseCurrency(priceEl?.textContent ?? '');
    const annualCashFlow = parseCurrency(cashFlowEl?.textContent ?? '');

    if (!askingPrice || !annualCashFlow) {
      log(`Listing ${index + 1}: Invalid data. Price: ${askingPrice}, Cash Flow: ${annualCashFlow}`);
      return;
    }

    const monthlyDebt = calculateMonthlyDebt(askingPrice);
    // const annualDebt = monthlyDebt * 12;
    const dscr = (annualCashFlow/12) / monthlyDebt;
    const netMonthly = (annualCashFlow / 12) - monthlyDebt;

    const info = document.createElement('div');
    info.className = 'dscr-injected';
    info.style.marginTop = '6px';
    info.style.fontSize = '13px';
    info.style.fontWeight = 'bold';
    info.style.color = dscr < 1 ? 'red' : dscr < 1.25 ? 'orange' : 'green';
    info.innerHTML = `
      📊 DSCR: ${dscr.toFixed(2)}<br>
      💸 Net/Month: $${netMonthly.toFixed(0)}
    `;

    try {
      cashFlowEl.parentElement.appendChild(info);
      log(`Listing ${index + 1}: Injected metrics → DSCR=${dscr.toFixed(2)}, Net/Month=$${netMonthly.toFixed(0)}`);
    } catch (e) {
      console.error(`[DSCR Extension] Failed to append metrics for listing ${index + 1}:`, e);
    }
  });
}

// ========= DOM Observer for Dynamic Angular Rendering =========
function startObserver() {
  const observer = new MutationObserver((mutations, obs) => {
    const listings = findListings();
    if (listings.length > 0) {
      log("Listings detected — injecting financial metrics...");
      injectMetrics();
      obs.disconnect(); // Stop observing once content is ready
    } else {
      log("Waiting for listings...");
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  log("Observer attached to DOM. Awaiting listing content...");
}

// ========= Start Everything =========
(function () {
  log("DSCR Extension loaded.");
  startObserver();

  // Optional: Redundant delayed injection in case listings load late
  setTimeout(() => {
    log("Timeout reached — attempting manual injection.");
    injectMetrics();
  }, 10000);
})();
