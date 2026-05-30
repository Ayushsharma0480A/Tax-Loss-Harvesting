export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "₹0.00";
  const abs = Math.abs(value);
  let formatted;
  if (abs >= 1e7) formatted = (value / 1e7).toFixed(2) + " Cr";
  else if (abs >= 1e5) formatted = (value / 1e5).toFixed(2) + " L";
  else formatted = value.toFixed(decimals);
  return "₹" + formatted;
};

export const formatNumber = (value, maxDecimals = 8) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  if (Math.abs(value) < 1e-10) return "~0";
  if (Math.abs(value) < 0.001) return value.toExponential(3);
  return parseFloat(value.toPrecision(6)).toString();
};

export const formatPrice = (value) => {
  if (!value) return "₹0";
  if (value >= 1000) return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  if (value < 0.001) return "₹" + value.toExponential(4);
  return "₹" + value.toFixed(value < 1 ? 6 : 2);
};

export const isPositive = (val) => val > 0;
export const isNegative = (val) => val < 0;
