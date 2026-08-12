import { useState, useEffect, ReactNode } from "react";
import { Wifi, Battery, Signal, ShieldCheck, EyeOff, Smartphone } from "lucide-react";

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [time, setTime] = useState("12:45");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, "0");
      const mins = String(now.getUTCMinutes()).padStart(2, "0");
      setTime(`${hrs}:${mins}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center py-6 px-4 font-sans select-none relative overflow-hidden">
      
      {/* Cinematic abstract background lights to framing our workspace */}
      <div className="absolute left-[-10%] top-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[50%] h-[50%] bg-[#1E3A8A]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main outer metal housing container, rendering on md screens and above */}
      <div className="relative w-full max-w-[400px] h-[820px] bg-black border-4 border-zinc-800 rounded-[44px] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_10px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden animate-fade-in relative">
        
        {/* Dynamic android physical punch hole sensor notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-50 flex items-center justify-center border border-zinc-900 shadow-inner">
          {/* Audio receiver grill and camera optical spot */}
          <div className="w-10 h-1 bg-zinc-950 rounded-full shrink-0" />
          <div className="w-2.5 h-2.5 bg-[#030303] rounded-full shrink-0 ml-3.5 border border-zinc-900 relative">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-[#090b4d] rounded-full opacity-60" />
          </div>
        </div>

        {/* Outer glass reflection glares */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-linear-to-bl from-white/2 to-transparent pointer-events-none z-40 skew-x-12" />

        {/* Dynamic hardware physical buttons (left side volume, right side lock) */}
        <div className="absolute left-[-6px] top-40 w-1.5 h-16 bg-zinc-800 rounded-l rounded-y z-50 shadow" />
        <div className="absolute left-[-6px] top-60 w-1.5 h-12 bg-zinc-800 rounded-l rounded-y z-50 shadow" />
        <div className="absolute right-[-6px] top-48 w-1.5 h-20 bg-zinc-800 rounded-r rounded-y z-50 shadow" />

        {/* Android top status system tray bar */}
        <div className="h-11 bg-[#0B1220] px-6 text-[10px] font-bold text-[#F0F0F0] flex items-end justify-between pb-1.5 z-40 shrink-0 select-none relative border-b border-[#1E293B]/20 select-none">
          {/* Operator Clock */}
          <span className="font-mono tracking-tight font-bold">{time} UTC</span>
          
          {/* System Indicators */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-[#F0F0F0]" />
            <Wifi className="w-3.5 h-3.5 text-[#F0F0F0]" />
            <div className="flex items-center gap-1">
              <span className="font-mono text-[9px] font-bold">98%</span>
              <Battery className="w-4 h-4 text-[#F0F0F0]" />
            </div>
          </div>
        </div>

        {/* Phone screen inner viewport panel containing of children */}
        <div className="flex-1 bg-[#0B1220] p-5 overflow-y-auto no-scrollbar relative flex flex-col z-30 select-none">
          {children}
        </div>

        {/* Virtual Android navigation navigation pill bar */}
        <div className="h-6 bg-[#0B1220] flex items-center justify-center shrink-0 z-40 relative select-none">
          <div className="w-32 h-1 bg-zinc-650 rounded-full hover:bg-zinc-400 cursor-pointer duration-100" />
        </div>

      </div>

    </div>
  );
}
