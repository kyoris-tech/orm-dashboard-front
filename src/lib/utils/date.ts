import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY');
}
