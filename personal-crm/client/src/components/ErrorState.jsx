import { CircleAlert, RotateCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return <div className="error-state" role="alert">
    <span className="error-icon"><CircleAlert size={22} /></span>
    <h3>{title}</h3>
    <p>{description || 'We could not load this information. Please try again.'}</p>
    {onRetry && <button className="button button-quiet button-small" onClick={onRetry}><RotateCw size={14} /> Try again</button>}
  </div>;
}
