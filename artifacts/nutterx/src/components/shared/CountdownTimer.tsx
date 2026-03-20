import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountdownTimer({ endsAt, className }: { endsAt: string, className?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const end = new Date(endsAt);
      const now = new Date();
      
      if (now > end) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, expired: true });
        return;
      }
      
      const days = differenceInDays(end, now);
      const hours = differenceInHours(end, now) % 24;
      const mins = differenceInMinutes(end, now) % 60;
      
      setTimeLeft({ days, hours, mins, expired: false });
    };
    
    calc();
    const interval = setInterval(calc, 60000); // update every minute
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.expired) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive font-medium bg-destructive/10 px-3 py-1.5 rounded-lg w-fit", className)}>
        <Clock className="w-4 h-4" />
        Subscription Expired
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-xl w-16 h-16 shadow-inner">
        <span className="text-xl font-bold text-blue-400 font-display">{timeLeft.days}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Days</span>
      </div>
      <span className="text-white/20 font-bold">:</span>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-xl w-14 h-16 shadow-inner">
        <span className="text-lg font-bold text-white/80 font-display">{timeLeft.hours}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hrs</span>
      </div>
    </div>
  );
}
