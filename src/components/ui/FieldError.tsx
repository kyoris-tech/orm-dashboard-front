export interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="text-danger text-xs mt-1 px-4 text-left">
      {message}
    </p>
  );
}
