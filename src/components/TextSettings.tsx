import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Type } from 'lucide-react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type LineHeight = 'tight' | 'normal' | 'relaxed' | 'loose';

interface TextSettingsProps {
  fontSize: FontSize;
  lineHeight: LineHeight;
  onFontSizeChange: (size: FontSize) => void;
  onLineHeightChange: (height: LineHeight) => void;
}

const fontSizeOptions: { value: FontSize; label: string; class: string }[] = [
  { value: 'small', label: 'Small', class: 'text-lg' },
  { value: 'medium', label: 'Medium', class: 'text-2xl' },
  { value: 'large', label: 'Large', class: 'text-3xl' },
  { value: 'xlarge', label: 'Extra Large', class: 'text-4xl' },
];

const lineHeightOptions: { value: LineHeight; label: string }[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
];

export const getFontSizeClass = (size: FontSize): string => {
  const option = fontSizeOptions.find(o => o.value === size);
  return option?.class || 'text-2xl';
};

export const getLineHeightClass = (height: LineHeight): string => {
  switch (height) {
    case 'tight': return 'leading-snug';
    case 'normal': return 'leading-normal';
    case 'relaxed': return 'leading-relaxed';
    case 'loose': return 'leading-loose';
    default: return 'leading-relaxed';
  }
};

const TextSettings: React.FC<TextSettingsProps> = ({
  fontSize,
  lineHeight,
  onFontSizeChange,
  onLineHeightChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Type className="w-4 h-4" />
          Text
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Font Size</DropdownMenuLabel>
        {fontSizeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onFontSizeChange(option.value)}
            className={fontSize === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Line Height</DropdownMenuLabel>
        {lineHeightOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onLineHeightChange(option.value)}
            className={lineHeight === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextSettings;