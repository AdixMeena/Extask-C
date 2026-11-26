export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" fill="none" stroke="#141B4D" strokeWidth="2">
        <rect x="18" y="14" width="84" height="62" rx="4" fill="#FFFDF8" />
        <path d="M32 34h42M32 46h56M32 58h30" strokeDasharray="4 5" strokeLinecap="round" />
        <circle cx="60" cy="14" r="6" fill="#FF6B35" />
      </svg>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
