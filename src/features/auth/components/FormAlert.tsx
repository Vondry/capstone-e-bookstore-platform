/**
 * FormAlert - inline server error shown above a form's submit button (S1).
 * Same 3 px left bar + layer-2 surface as the toast, coloured with --support-error.
 */

import { WarningFilled } from '@carbon/icons-react';

export type FormAlertProps = {
  message: string | null;
};

export function FormAlert({ message }: Readonly<FormAlertProps>) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-12 border-l-[3px] border-support-error bg-layer-2 px-16 py-12 text-14 text-text-primary"
    >
      <WarningFilled size={16} aria-hidden="true" className="mt-2 shrink-0 text-support-error" />
      <p>{message}</p>
    </div>
  );
}
