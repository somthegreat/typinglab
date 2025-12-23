import React from 'react';
import { useSound } from '@/contexts/SoundContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const SoundSettings: React.FC = () => {
  const { soundEnabled, volume, toggleSound, setVolume } = useSound();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {soundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sound Effects</span>
            <Button 
              variant={soundEnabled ? "default" : "outline"} 
              size="sm"
              onClick={toggleSound}
            >
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>
          
          {soundEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volume</span>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SoundSettings;