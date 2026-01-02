import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'button';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  lines = 1 
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className}`} style={{ minHeight: '200px' }} />
    );
  }
  
  if (variant === 'circle') {
    return (
      <div className={`${baseClasses} rounded-full ${className}`} />
    );
  }
  
  if (variant === 'button') {
    return (
      <div className={`${baseClasses} h-10 ${className}`} />
    );
  }
  
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} h-4 mb-2 ${className}`}
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </>
  );
};

export const BookingCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="text" className="w-32 h-6" />
      <Skeleton variant="circle" className="w-16 h-6" />
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="text" className="w-24" />
      <Skeleton variant="button" className="w-full mt-4" />
    </div>
  </div>
);

export const ScheduleCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border/50 shadow-md p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="flex-1">
        <Skeleton variant="text" className="w-32 h-5 mb-2" />
        <Skeleton variant="text" className="w-24 h-4" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-4">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
    </div>
    <Skeleton variant="button" className="w-full" />
  </div>
);

