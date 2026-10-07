import { Button } from './Button';
import { SecondaryButton } from './SecondaryButton';

export interface ModalActionsProps {
  formId: string;
  submitLabel: string;
  onCancel: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  cancelLabel?: string;
}

export function ModalActions({ formId, submitLabel, onCancel, isSubmitting, disabled, cancelLabel = 'Cancelar' }: ModalActionsProps) {
  return (
    <div className="flex gap-4">
      <SecondaryButton onClick={onCancel} className="flex-1">
        {cancelLabel}
      </SecondaryButton>

      <Button type="submit" form={formId} variant="accent" loading={isSubmitting} disabled={disabled} className="flex-1">
        {submitLabel}
      </Button>
    </div>
  );
}
