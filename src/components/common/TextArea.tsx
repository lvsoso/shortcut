import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-fg-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-md border bg-input px-3 py-2 text-fg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-accent/35 focus:border-accent
            ${error ? 'border-state-danger' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-state-danger">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
