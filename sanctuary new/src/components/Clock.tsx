import React, { useState, useEffect, memo } from 'react';
import { cn } from '../lib/utils';

const ClockComponent = () => {
  const [time, setTime] = useState(new Date());
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setColonVisible(v => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="glass rounded-[24px] p-6 flex flex-col items-center justify-center space-y-1 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10">
      <div className="flex items-baseline gap-1">
        <div className="flex items-center">
          <span className="text-[3rem] font-[200] font-sans tracking-tight leading-none text-on-surface">
            {hours}
          </span>
          <span className={cn(
            "text-[3rem] font-[200] font-sans leading-none text-primary transition-opacity duration-300",
            !colonVisible && "opacity-0"
          )}>
            :
          </span>
          <span className="text-[3rem] font-[200] font-sans tracking-tight leading-none text-on-surface">
            {minutes}
          </span>
        </div>
        <span className="text-[1.2rem] font-[400] text-on-surface-variant ml-2 tabular-nums">
          {seconds}
        </span>
      </div>
      <p className="caption-text uppercase tracking-[0.2em] font-bold">
        {dateStr}
      </p>
    </div>
  );
};

export const Clock = memo(ClockComponent);
export default Clock;
