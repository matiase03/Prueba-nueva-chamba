function fmt(n) {
  if (n === 0) return "0";
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? r.toString() : r.toFixed(1);
}
