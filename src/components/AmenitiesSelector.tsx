import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const PREDEFINED_AMENITIES = [
  'USB Charging',
  'TV',
  'AC',
  'Refreshments',
  'Toilet',
] as const;

interface AmenitiesSelectorProps {
  value: string[];
  onChange: (amenities: string[]) => void;
  label?: string;
}

export const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({
  value = [],
  onChange,
  label = 'Amenities',
}) => {
  const [customAmenity, setCustomAmenity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleToggleAmenity = (amenity: string) => {
    if (value.includes(amenity)) {
      onChange(value.filter((a) => a !== amenity));
    } else {
      onChange([...value, amenity]);
    }
  };

  const handleAddCustom = () => {
    if (customAmenity.trim() && !value.includes(customAmenity.trim())) {
      onChange([...value, customAmenity.trim()]);
      setCustomAmenity('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    onChange(value.filter((a) => a !== amenity));
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Predefined Amenities */}
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_AMENITIES.map((amenity) => {
          const isSelected = value.includes(amenity);
          return (
            <button
              key={amenity}
              type="button"
              onClick={() => handleToggleAmenity(amenity)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-teal text-white border-2 border-teal'
                    : 'bg-muted text-muted-foreground border-2 border-border hover:border-teal/50'
                }
              `}
            >
              {amenity}
            </button>
          );
        })}
      </div>

      {/* Selected Amenities Display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Selected Amenities:</Label>
          <div className="flex flex-wrap gap-2">
            {value.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Amenity Input */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="Enter custom amenity"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            size="sm"
            variant="outline"
          >
            Add
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomAmenity('');
            }}
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setShowCustomInput(true)}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Amenity
        </Button>
      )}
    </div>
  );
};

