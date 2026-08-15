import { cn } from '@/lib/utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn('min-h-screen w-full flex flex-col items-center px-6 py-10', className)}>{children}</main>;
}
