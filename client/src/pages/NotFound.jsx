import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState title="This notice was taken down" text="The page you are looking for is not on the board."
        action={<Link to="/" className="btn btn--primary">Back to the board</Link>} />
    </div>
  );
}
