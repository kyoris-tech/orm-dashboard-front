export function formatPhoneNumber(phone: string): string {
  if (!phone) {
    return '';
  }

  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    const ddiMatch = cleaned.match(/^\+(\d{1,3})/);
    const ddi = ddiMatch ? ddiMatch[1] : '';
    const rest = cleaned.replace(/^\+\d{1,3}/, '');

    if (ddi === '55' && rest.length >= 10) {
      return `+${ddi} (${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`;
    }

    return `+${ddi} ${rest.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1 $2-$3')}`;
  }

  const local = cleaned.replace(/^0+/, '');

  if (local.length <= 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }

  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
}

export function getDDI(phone: string): string {
  if (!phone) {
    return '55';
  }

  const match = phone.match(/^\+?(\d{1,3})/);

  if (match) {
    const ddi = match[1];
    return ddi.length === 2 || ddi.length === 3 ? ddi : '55';
  }

  return '55';
}

export function getLocalNumber(phone: string): string {
  if (!phone) {
    return '';
  }

  const cleaned = phone.replace(/\D/g, '');

  return cleaned.length > 11 ? cleaned.slice(cleaned.length - 11) : cleaned;
}
