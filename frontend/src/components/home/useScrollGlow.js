import { useEffect, useRef, useState } from 'react';

/**
 * useScrollGlow
 * Returns [ref, glowClass] where glowClass is:
 *   'sg-hidden'  — below viewport (not yet scrolled to)
 *   'sg-visible' — inside viewport (fully glowed up)
 *   'sg-past'    — above viewport (faded out upward)
 */
const useScrollGlow = (threshold = 0.12) => {
  const ref = useRef(null);
  const [state, setState] = useState('sg-hidden');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('sg-visible');
        } else {
          // If top edge is above viewport → scrolled past
          setState(entry.boundingClientRect.top < 0 ? 'sg-past' : 'sg-hidden');
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, state];
};

export default useScrollGlow;