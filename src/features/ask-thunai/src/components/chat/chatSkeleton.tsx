import React from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const ChatSkeleton = () => (
  <div className="w-full max-w-4xl px-6">
    <div className="flex flex-col gap-4">
      {/* User message skeleton */}
      <div className="flex justify-end">
        <div className="bg-muted/30 rounded-lg p-4 max-w-[70%]">
          <Skeleton height={20} width={200} />
          <Skeleton height={16} width={240} />
        </div>
      </div>
      
      {/* AI response skeleton */}
      <div className="flex justify-start">
        <div className="bg-muted/30 rounded-lg p-4 max-w-[70%]">
          <Skeleton height={20} width={220} />
          <Skeleton count={3} width={280} />
        </div>
      </div>
      
      {/* Second user message skeleton */}
      <div className="flex justify-end">
        <div className="bg-muted/30 rounded-lg p-4 max-w-[70%]">
          <Skeleton height={20} width={190} />
          <Skeleton height={16} width={260} />
        </div>
      </div>
      
      {/* Second AI response skeleton */}
      <div className="flex justify-start">
        <div className="bg-muted/30 rounded-lg p-4 max-w-[70%]">
          <Skeleton height={20} width={200} />
          <Skeleton count={4} width={300} />
        </div>
      </div>
    </div>
  </div>
);
