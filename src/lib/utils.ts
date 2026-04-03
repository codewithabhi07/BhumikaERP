export function calculateThreeTableSqFt(length: number, width: number, quantity: number): number {
  // 1. Width Slab Logic (The '3 Table' Rule)
  // Round width up to the nearest multiple of 3 (3, 6, 9, 12, etc.)
  const slabWidth = Math.ceil(width / 3) * 3;

  // 2. Base Area Calculation
  // Formula: (Length * SlabWidth * Quantity) / 144
  const rawSqFt = (length * slabWidth * quantity) / 144;

  // 3. Contractor Precision Rounding
  // Always round UP to the nearest 0.25 step
  // Epsilon (0.0001) handles floating point errors
  const finalSqFt = Math.ceil((rawSqFt - 0.0001) * 4) / 4;

  return finalSqFt;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Zero";
  const words: { [key: number]: string } = {
    0: '', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  function convert(n: number): string {
    if (n < 20) return words[n];
    if (n < 100) return words[Math.floor(n / 10) * 10] + (n % 10 !== 0 ? " " + words[n % 10] : "");
    if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  }

  return convert(Math.round(amount));
}
