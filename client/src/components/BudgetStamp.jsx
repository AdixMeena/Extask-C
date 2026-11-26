import { motion } from 'framer-motion';
import { formatINR } from '../utils/format.js';

// The orange rupee "rubber stamp". It scales and rotates in when it appears on screen.
export default function BudgetStamp({ amount, label = 'budget', size = 'md' }) {
  return (
    <motion.div
      className={`stamp stamp--${size}`}
      initial={{ scale: 2.4, rotate: -28, opacity: 0 }}
      whileInView={{ scale: 1, rotate: -8, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.22, 1.3, 0.36, 1] }}
    >
      <span className="stamp__label">{label}</span>
      <span className="stamp__amount">{formatINR(amount)}</span>
    </motion.div>
  );
}
