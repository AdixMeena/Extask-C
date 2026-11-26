import { useState } from 'react';

const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';

function Star({ size, filled, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d={STAR_PATH}
        fill={filled ? 'var(--orange)' : 'none'}
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Read-only (value only, supports decimals like 4.5) or interactive (pass onChange).
export default function RatingStars({ value = 0, onChange, size = 20, label = 'Rating' }) {
  const [hover, setHover] = useState(0);

  if (!onChange) {
    const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
    return (
      <span className="stars" role="img" aria-label={`${Number(value).toFixed(1)} out of 5`}>
        <span className="stars__row">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={size} />
          ))}
        </span>
        <span className="stars__row stars__row--fill" style={{ width: `${pct}%` }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={size} filled />
          ))}
        </span>
      </span>
    );
  }

  const shown = hover || value;
  return (
    <div className="stars-input" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`star-btn ${n <= shown ? 'is-on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star size={size + 8} />
          <Star size={size + 8} filled className="star-btn__fill" />
        </button>
      ))}
    </div>
  );
}
