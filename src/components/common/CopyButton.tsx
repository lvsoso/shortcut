import { Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, size = 'sm' }: CopyButtonProps) {
  const { copy, copied } = useClipboard();

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={() => copy(text)}
      className="gap-1"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          已复制
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          复制
        </>
      )}
    </Button>
  );
}
