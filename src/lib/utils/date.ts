import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY');
}

export function formatDateTime(value: string | null): string {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : '';
}
