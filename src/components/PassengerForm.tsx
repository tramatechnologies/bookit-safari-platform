import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PassengerInfo {
  name: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  category: 'adult' | 'student' | 'child' | '';
  age?: number;
  phone?: string;
  email?: string;
}

interface PassengerFormProps {
  passengerNumber: number;
  seatId: string;
  passenger: PassengerInfo;
  onChange: (passenger: PassengerInfo) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  errors?: Record<string, string>;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengerNumber,
  seatId,
  passenger,
  onChange,
  onRemove,
  canRemove = false,
  errors = {},
}) => {
  const handleChange = (field: keyof PassengerInfo, value: any) => {
    onChange({
      ...passenger,
      [field]: value,
    });
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center">
            <User className="w-4 h-4 text-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Passenger {passengerNumber}</h3>
            <p className="text-xs text-muted-foreground">Seat {seatId}</p>
          </div>
        </div>
        {canRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`name-${passengerNumber}`}>
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`name-${passengerNumber}`}
            value={passenger.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter passenger full name"
            className={errors.name ? 'border-destructive' : ''}
            required
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`gender-${passengerNumber}`}>
            Gender <span className="text-destructive">*</span>
          </Label>
          <Select
            value={passenger.gender}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger id={`gender-${passengerNumber}`} className={errors.gender ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive mt-1">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`category-${passengerNumber}`}>
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={passenger.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger id={`category-${passengerNumber}`} className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Adult</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="child">Child</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive mt-1">{errors.category}</p>
          )}
        </div>

        {passenger.category === 'child' && (
          <div className="space-y-2">
            <Label htmlFor={`age-${passengerNumber}`}>
              Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`age-${passengerNumber}`}
              type="number"
              min="0"
              max="17"
              value={passenger.age || ''}
              onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter age"
              className={errors.age ? 'border-destructive' : ''}
              required={passenger.category === 'child'}
            />
            {errors.age && (
              <p className="text-xs text-destructive mt-1">{errors.age}</p>
            )}
          </div>
        )}

        {passengerNumber === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`phone-${passengerNumber}`}>
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`phone-${passengerNumber}`}
                type="tel"
                value={passenger.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className={errors.phone ? 'border-destructive' : ''}
                required
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`email-${passengerNumber}`}>Email (Optional)</Label>
              <Input
                id={`email-${passengerNumber}`}
                type="email"
                value={passenger.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

