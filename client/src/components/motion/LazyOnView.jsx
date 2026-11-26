import { useInView } from 'framer-motion';
import { Suspense, useRef } from 'react';

// Renders (and therefore downloads + fetches data for) its children only when the user
// scrolls near it. Keeps the first paint of long pages fast on phones.
export default function LazyOnView({ children, minHeight = 320, margin = '300px' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  return (
    <div ref={ref} style={inView ? undefined : { minHeight }}>
      {inView && <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense>}
    </div>
  );
}
