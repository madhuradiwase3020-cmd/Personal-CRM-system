import { useEffect, useState } from 'react';
import { ArrowUpRight, BarChart3, CheckCircle2, HeartHandshake, UsersRound, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ErrorState from '../components/ErrorState';

function Bars({ title, values, color = 'violet' }) {
  const max = Math.max(1, ...values.map(item => item.count));
  return <section className="panel report-panel"><div className="panel-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>{title}</h2></div><BarChart3 size={18} className="report-heading-icon" /></div>
    {!values.length ? <p className="quiet-copy">Your data will start to take shape as you add records.</p> : <div className="bar-list">{values.map(item => <div className="bar-row" key={item._id}><div className="bar-label"><span>{item._id || 'Other'}</span><strong>{item.count}</strong></div><div className="bar-track"><span className={`bar-fill bar-${color}`} style={{ width: `${Math.max(5, (item.count / max) * 100)}%` }} /></div></div>)}</div>}
  </section>;
}

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const toast = useToast();
  useEffect(() => {
    setLoading(true);
    setError('');
    api.reports().then(setReport).catch(error => {
      setError(error.message);
      toast(error.message, 'error');
    }).finally(() => setLoading(false));
  }, [reload]);
  if (loading) return <div className="loading-page"><span className="spinner" /> Gathering your insights…</div>;
  if (error) return <div className="page-enter"><ErrorState description={error} onRetry={() => setReload(value => value + 1)} /></div>;
  const cards = [
    { label: 'People remembered', value: report?.totalContacts || 0, icon: UsersRound, tone: 'lavender', insight: 'A growing circle' },
    { label: 'Conversations logged', value: report?.totalInteractions || 0, icon: Waypoints, tone: 'peach', insight: `${report?.interactionsThisMonth || 0} this month` },
    { label: 'Follow-throughs', value: report?.totalTasks || 0, icon: CheckCircle2, tone: 'mint', insight: 'Every little action counts' }
  ];
  return <div className="page-enter"><div className="page-heading"><div><span className="eyebrow">YOUR CONNECTIONS, OVER TIME</span><h1>Insights & reports</h1><p>A gentle pulse-check on how you’re showing up for your people.</p></div><span className="report-period">All time <ArrowUpRight size={15} /></span></div>
    <div className="report-highlight"><div className="highlight-symbol"><HeartHandshake size={25} /></div><div><span className="eyebrow light-eyebrow">A THOUGHTFUL PRACTICE</span><h2>Consistency beats intensity.</h2><p>Every conversation you make time for is a thread in a stronger relationship.</p></div><div className="highlight-stat"><strong>{report?.interactionsThisMonth || 0}</strong><small>moments logged<br />this month</small></div></div>
    <div className="report-stat-grid">{cards.map(({ label, value, icon: Icon, tone, insight }) => <article className="report-stat panel" key={label}><span className={`stat-icon ${tone}`}><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong><span>{insight}</span></div></article>)}</div>
    <div className="report-charts"><Bars title="Your circle" values={report?.contactsByRelationship || []} color="violet" /><Bars title="How you connect" values={report?.interactionsByType || []} color="peach" /><Bars title="Tasks & follow-through" values={report?.tasksByStatus || []} color="mint" /></div>
    <p className="report-footnote">These insights are private to you and based on the records in your workspace.</p>
  </div>;
}
