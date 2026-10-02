/**
 * PasswordInput - TextInput with a show/hide toggle (Carbon View / ViewOff) and optional helper text
 */

import { useId, useState } from 'react';
import { View, ViewOff } from '@carbon/icons-react';
import { TextInput, type TextInputProps } from '@/components/ui/TextInput';

export type PasswordInputProps = Omit<TextInputProps, 'type' | 'icon'> & {
  /** Rule shown under the field while there is no error, e.g. "At least 8 characters" */
  helperText?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function PasswordInput({ helperText, error, id: providedId, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const helperId = `${id}-helper`;
  const showHelper = Boolean(helperText) && !error;
  let describedBy: string | undefined;
  if (error) describedBy = `${id}-error`;
  else if (showHelper) describedBy = helperId;

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        error={error}
        aria-describedby={describedBy}
        icon={
          <button
            type="button"
            aria-label="Show password"
            aria-pressed={visible}
            aria-controls={id}
            onClick={() => {
              setVisible((current) => !current);
            }}
            className="-mr-16 flex h-48 w-48 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
          >
            {visible ? (
              <ViewOff size={20} aria-hidden="true" />
            ) : (
              <View size={20} aria-hidden="true" />
            )}
          </button>
        }
      />
      {showHelper && (
        <p id={helperId} className="text-12 text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
