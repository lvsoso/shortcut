import { ReactNode } from 'react';

interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolContainer({ title, description, children }: ToolContainerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
