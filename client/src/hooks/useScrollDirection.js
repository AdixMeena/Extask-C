import { useEffect, useRef, useState } from 'react';

// true while the user scrolls down (after the first 80px), false when scrolling up. Drives the navbar.
export function useScrollDirection(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY.current) > threshold) {
          setHidden(y > lastY.current && y > 80);
          lastY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}
