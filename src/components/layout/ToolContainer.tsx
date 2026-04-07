import { ReactNode } from 'react';

type ToolContainerLayout = 'full' | 'narrow';

interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  layout?: ToolContainerLayout;
}

export function ToolContainer({
  children,
  layout = 'full',
}: ToolContainerProps) {
  const contentClassName = layout === 'narrow'
    ? 'mx-auto w-full max-w-5xl'
    : 'h-full min-h-0 w-full';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-card shadow-panel">
      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}
