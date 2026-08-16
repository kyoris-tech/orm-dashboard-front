const SALES_WHATSAPP_NUMBER = '5511911755526';

export function buildWhatsappLink(message: string): string {
  return `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
