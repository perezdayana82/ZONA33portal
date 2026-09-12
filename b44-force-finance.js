(() => {
  let tries = 0;
  const timer = setInterval(() => {
    if (window.__b44FinanceOverview) {
      clearInterval(timer);
      window.__b44FinanceOverview();
    } else if (++tries > 80) {
      clearInterval(timer);
    }
  }, 100);
})();
