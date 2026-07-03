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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOver: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const padZero = (num: number) => {
    return num.toString().padStart(2, "0");
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
