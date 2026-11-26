import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ small = false }) {
  return (
    <span className={`verified ${small ? 'verified--sm' : ''}`} title="ID details checked by ExTask">
      <BadgeCheck size={small ? 14 : 16} aria-hidden="true" />
      Verified
    </span>
  );
}
