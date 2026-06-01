export function formatBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);

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
