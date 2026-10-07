import { Badge, type BadgeProps } from './Badge';

export interface BadgeGroupProps {
  label: string;
  items: string[];
  tone: BadgeProps['tone'];
}

export function BadgeGroup({ label, items, tone }: BadgeGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm text-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} tone={tone}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
