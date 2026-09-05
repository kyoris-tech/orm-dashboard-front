export interface ManualContentProps {
  isAdmin: boolean;
}

export interface ManualSectionDefinition {
  id: string;
  title: string;
  navLabel: string;
  adminOnly?: boolean;
  Content: (props: ManualContentProps) => React.ReactNode;
}
