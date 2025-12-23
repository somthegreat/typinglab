import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Keyboard } from 'lucide-react';

export type KeyboardLayout = 'qwerty' | 'dvorak' | 'colemak';

interface KeyboardLayoutSelectorProps {
  layout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
}

const layouts: { value: KeyboardLayout; label: string }[] = [
  { value: 'qwerty', label: 'QWERTY' },
  { value: 'dvorak', label: 'Dvorak' },
  { value: 'colemak', label: 'Colemak' },
];

const KeyboardLayoutSelector: React.FC<KeyboardLayoutSelectorProps> = ({
  layout,
  onLayoutChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="w-4 h-4" />
          {layout.toUpperCase()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40" align="end">
        <div className="space-y-1">
          {layouts.map(({ value, label }) => (
            <Button
              key={value}
              variant={layout === value ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => onLayoutChange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KeyboardLayoutSelector;