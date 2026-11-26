import { motion } from 'framer-motion';

// Fade + rise when scrolled into view. `as` picks the HTML tag; `delay` staggers siblings.
export default function Reveal({ as = 'div', delay = 0, y = 22, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
