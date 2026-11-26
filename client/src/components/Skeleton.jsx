// Loading placeholders. The shimmer is a moving gradient layer (transform only), see components.css.
export const Skeleton = ({ height = 16, width = '100%', className = '' }) => (
  <div className={`skeleton ${className}`} style={{ height, width }} aria-hidden="true" />
);

export const TaskCardSkeleton = () => (
  <div className="task-card task-card--skeleton" aria-hidden="true">
    <Skeleton height={22} width="70%" />
    <Skeleton height={14} />
    <Skeleton height={14} width="85%" />
    <Skeleton height={14} width="40%" />
  </div>
);
