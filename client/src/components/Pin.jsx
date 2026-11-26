// The drawing-pin that holds a task card to the board.
export default function Pin() {
  return (
    <svg className="pin" viewBox="0 0 28 34" width="26" height="32" aria-hidden="true">
      <path d="M14 18 V32" stroke="#141B4D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="11" r="9" fill="#FF6B35" stroke="#141B4D" strokeWidth="2" />
      <circle cx="11" cy="8" r="2.4" fill="#fff" opacity=".65" />
    </svg>
  );
}
