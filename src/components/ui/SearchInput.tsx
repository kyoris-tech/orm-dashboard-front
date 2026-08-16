import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className }: SearchInputProps) {
  return (
    <div className={cn('relative w-full max-w-3xl', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-60" size={24} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-border focus:border-accent h-[60px] pl-10 pr-4 py-2 text-base outline-none text-primary placeholder:text-muted placeholder:font-medium bg-surface focus:shadow-[0_0_0_2px_rgba(0,122,255,0.2)] transition-all"
      />
    </div>
  );
}
