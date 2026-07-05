import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string; // ISO format
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  const safeParseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date("2026-11-27T17:00:00");
    
    // 1. Try standard parser
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // 2. Try replacing space with 'T' (standard ISO format)
    const normalizedISO = dateStr.replace(" ", "T");
    date = new Date(normalizedISO);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // 3. Try parsing parts manually (extremely safe for strict mobile engines like Safari)
    // Supports: "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD HH:mm", "YYYY/MM/DD HH:mm:ss"
    const parts = dateStr.split(/[- : T /]/i);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed in JS Date
      const day = parseInt(parts[2], 10);
      const hour = parts[3] ? parseInt(parts[3], 10) : 0;
      const minute = parts[4] ? parseInt(parts[4], 10) : 0;
      const second = parts[5] ? parseInt(parts[5], 10) : 0;
      
      date = new Date(year, month, day, hour, minute, second);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Fallback to wedding date
    return new Date("2026-11-27T17:00:00");
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const parsedTarget = safeParseDate(targetDate);
      const difference = parsedTarget.getTime() - Date.now();
      
      if (difference <= 0 || isNaN(difference)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOver: true,
        });
        return;
      }

      // Safe, step-by-step integer arithmetic (avoids floating-point modulo quirks)
      const totalSeconds = Math.floor(difference / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isOver: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const padZero = (num: number) => {
    const val = isNaN(num) ? 0 : num;
    return val.toString().padStart(2, "0");
  };

  if (timeLeft.isOver) {
    return (
      <div id="countdown-over" className="text-center py-6 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-sm mx-auto shadow-sm">
        <h3 className="font-serif text-2xl text-cream-50 font-semibold tracking-wide animate-pulse">
          ¡Llegó el gran día!
        </h3>
        <p className="font-sans text-sm text-cream-100/90 mt-2">
          Gracias por acompañarnos a celebrar nuestro amor.
        </p>
      </div>
    );
  }

  const items = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min.", value: timeLeft.minutes },
    { label: "Seg.", value: timeLeft.seconds },
  ];

  return (
    <div id="countdown-timer" className="w-full max-w-md mx-auto py-2 px-2 select-text">
      <h4 className="font-serif text-center text-xs tracking-[0.2em] text-cream-100/90 uppercase mb-4 font-bold">
        Faltan para el gran día
      </h4>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 justify-center">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-2xl shadow-sm transition-transform hover:scale-105"
          >
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {padZero(item.value)}
            </span>
            <span className="font-sans text-[10px] sm:text-xs text-cream-200/90 uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
