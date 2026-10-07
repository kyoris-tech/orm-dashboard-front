import { cn } from '@/lib/utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn('w-full flex flex-col items-center self-start px-6 py-10 pb-6', className)}>{children}</main>;
}
