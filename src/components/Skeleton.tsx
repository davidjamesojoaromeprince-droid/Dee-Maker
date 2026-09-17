import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="rounded-[32px] bg-white border border-slate-100 p-8 flex flex-col gap-4">
    <Skeleton className="aspect-video w-full" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const PricingSkeleton = () => (
  <div className="rounded-[32px] bg-white border border-slate-100 p-10 flex flex-col gap-6">
    <Skeleton className="h-4 w-24 rounded-full" />
    <Skeleton className="h-10 w-32" />
    <Skeleton className="h-4 w-48" />
    <div className="space-y-3 my-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
    <Skeleton className="h-14 w-full rounded-2xl" />
  </div>
);
