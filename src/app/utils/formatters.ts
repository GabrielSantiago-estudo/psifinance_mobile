export function formatBrazilianPhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 0 && !digits.startsWith('55')) {
    digits = `55${digits}`;
  }
  digits = digits.slice(0, 13);

  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const first = digits.slice(4, 9);
  const second = digits.slice(9, 13);

  let formatted = '';
  if (country) formatted += `+${country}`;
  if (area) formatted += ` (${area}`;
  if (area.length === 2) formatted += ')';
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;

  return formatted;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
