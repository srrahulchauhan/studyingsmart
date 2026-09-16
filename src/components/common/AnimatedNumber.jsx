import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({
  value,
  duration = 800,
  formatter = (v) => Math.round(v),
  className = '',
}) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);
  const startValRef = useRef(numericTarget);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const startVal = displayValue;
    const endVal = numericTarget;
    if (startVal === endVal) return;

    startTimeRef.current = null;
    startValRef.current = startVal;

    const easeOutQuad = (t) => t * (2 - t);

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const current = startVal + (endVal - startVal) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [numericTarget, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
