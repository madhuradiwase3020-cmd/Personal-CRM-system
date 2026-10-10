import { UsersRound } from 'lucide-react';

export default function EmptyState({ title = 'A little room to grow', description = 'Add your first record to get started.', action }) {
  return <div className="empty-state"><span className="empty-icon"><UsersRound size={24} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
