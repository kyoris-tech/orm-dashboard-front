import type { UseQueryResult } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

export interface QueryBoundaryProps<TData> {
  query: Pick<UseQueryResult<TData>, 'data' | 'isLoading' | 'isError'>;
  errorMessage: string;
  loadingClassName?: string;
  loadingSize?: number;
  errorClassName?: string;
  children: (data: TData) => React.ReactNode;
}

export function QueryBoundary<TData>({
  query,
  errorMessage,
  loadingClassName = 'h-40',
  loadingSize,
  errorClassName,
  children,
}: QueryBoundaryProps<TData>) {
  if (query.isLoading) {
    return <Spinner size={loadingSize} className={loadingClassName} />;
  }

  if (query.isError) {
    return <p className={cn('text-danger text-sm', errorClassName)}>{errorMessage}</p>;
  }

  if (query.data === undefined) {
    return null;
  }

  return <>{children(query.data)}</>;
}
