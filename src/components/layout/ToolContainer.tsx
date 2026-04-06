import { ReactNode } from 'react';

type ToolContainerLayout = 'full' | 'narrow';

interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  layout?: ToolContainerLayout;
}

export function ToolContainer({
  title,
  description,
  children,
  layout = 'full',
}: ToolContainerProps) {
  const contentClassName = layout === 'narrow'
    ? 'mx-auto w-full max-w-5xl'
    : 'h-full min-h-0 w-full';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-card shadow-panel">
      <div className="border-b border-border bg-card/90 px-6 py-5 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fg-muted">
          {layout === 'narrow' ? 'Focused Workspace' : 'Wide Workspace'}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg sm:text-[1.65rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-fg-secondary">{description}</p>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}
