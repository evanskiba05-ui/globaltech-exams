import React, { useState, useEffect } from 'react';
import { animate } from 'motion/react';

export const CountUp = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => setCount(Math.floor(latest)),
      ease: "easeOut"
    });
    return controls.stop;
  }, [value, duration]);
  return( 
  
  <>
  {count}
  </>);
};
