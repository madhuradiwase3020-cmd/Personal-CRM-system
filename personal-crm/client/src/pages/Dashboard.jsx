import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Building2, CalendarClock, CheckCircle2, CirclePlus, Clock3, HeartHandshake, UsersRound, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const dateText = value => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)) : 'No date';
const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const toast = useToast();
  useEffect(() => {
    setLoading(true);
    setError('');
    api.dashboard().then(setData).catch(error => {
      setError(error.message);
      toast(error.message, 'error');
    }).finally(() => setLoading(false));
  }, [reload]);
  if (loading) return <div className="loading-page"><span className="spinner" /> Getting things ready…</div>;
  if (error) return <div className="page-enter"><ErrorState description={error} onRetry={() => setReload(value => value + 1)} /></div>;
  const stats = [
    { label: 'People in your corner', value: data?.totalContacts || 0, icon: UsersRound, tone: 'lavender', detail: 'Across every part of life' },
    { label: 'Companies', value: data?.totalCompanies || 0, icon: Building2, tone: 'mint', detail: 'In your orbit' },
    { label: 'Follow-ups to come', value: data?.upcomingFollowUps || 0, icon: CalendarClock, tone: 'peach', detail: 'Keep the conversation going' },
    { label: 'Open tasks', value: data?.pendingTasks || 0, icon: CheckCircle2, tone: 'blue', detail: 'Small steps, stronger ties' }
  ];
  return <div className="page-enter">
    <div className="welcome-banner"><div><span className="eyebrow light-eyebrow">{todayLabel}</span><h1>Good day, {JSON.parse(localStorage.getItem('crm-user') || '{}').name?.split(' ')[0] || 'friend'} <span>✦</span></h1><p>A little intention goes a long way. Here’s your relationship snapshot.</p></div><div className="banner-art"><div className="banner-orbit" /><HeartHandshake size={48} strokeWidth={1.1} /></div><Link to="/contacts" className="banner-link">See your people <ArrowRight size={15} /></Link></div>
    <div className="stat-grid">{stats.map(({ label, value, icon: Icon, tone, detail }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><ArrowUpRight className="stat-arrow" size={17} /></article>)}</div>
    <div className="dashboard-columns">
      <section className="panel dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">KEEP IN TOUCH</span><h2>Today’s follow-ups</h2></div><Link to="/calendar" className="text-link">Open calendar <ArrowRight size={14} /></Link></div>
        {!data?.todayFollowUps?.length ? <div className="inline-empty"><span className="inline-empty-icon">☀</span><div><strong>A little breathing room</strong><p>No follow-ups on your calendar today. Enjoy the space.</p></div></div> : <div className="activity-list">{data.todayFollowUps.map(item => <div className="activity-item" key={item._id}><span className="activity-icon peach"><CalendarClock size={16} /></span><div className="activity-copy"><strong>{item.contact?.name || 'A contact'}</strong><p>{item.type} · {item.summary}</p></div><span className="activity-date">{dateText(item.nextFollowUp)}</span></div>)}</div>}
        <div className="panel-divider" /><div className="panel-heading compact-heading"><div><span className="eyebrow">RECENT MOMENTS</span><h2>Recent interactions</h2></div><Link to="/interactions" className="text-link">See all <ArrowRight size={14} /></Link></div>
        {!data?.recentInteractions?.length ? <p className="quiet-copy">Your conversations will find a home here.</p> : <div className="activity-list">{data.recentInteractions.slice(0, 4).map(item => <div className="activity-item" key={item._id}><span className="activity-icon lavender"><Waypoints size={16} /></span><div className="activity-copy"><strong>{item.contact?.name || 'A contact'} <span className="activity-verb">{item.type.toLowerCase()}</span></strong><p>{item.summary}</p></div><span className="activity-date">{dateText(item.date)}</span></div>)}</div>}
      </section>
      <section className="panel dashboard-panel people-panel"><div className="panel-heading"><div><span className="eyebrow">FRESH CONNECTIONS</span><h2>Recently added</h2></div><Link to="/contacts" className="text-link">All contacts <ArrowRight size={14} /></Link></div>
        {!data?.recentContacts?.length ? <EmptyState title="Your story starts here" description="Add someone to your circle and keep the details that matter." action={<Link className="button button-primary button-small" to="/contacts"><CirclePlus size={15} /> Add a contact</Link>} /> : <div className="recent-people">{data.recentContacts.map(person => <Link to={`/contacts/${person._id}`} className="recent-person" key={person._id}><span className="avatar avatar-contact">{person.name?.slice(0, 1).toUpperCase()}</span><span className="recent-person-info"><strong>{person.name}</strong><small>{person.jobTitle || person.relationshipType}{person.company?.name ? ` · ${person.company.name}` : ''}</small></span><ArrowRight size={15} /></Link>)}</div>}
        <div className="soft-callout"><span className="callout-icon"><Clock3 size={17} /></span><div><strong>Good things take a follow-up</strong><p>One small reach-out can make someone’s day.</p></div></div>
      </section>
    </div>
    {data?.dueTasks?.length > 0 && <section className="panel dashboard-tasks"><div className="panel-heading"><div><span className="eyebrow">ON YOUR RADAR</span><h2>Upcoming tasks</h2></div><Link to="/tasks" className="text-link">All tasks <ArrowRight size={14} /></Link></div><div className="task-preview-list">{data.dueTasks.map(task => <Link to="/tasks" key={task._id}><span className="task-preview-dot" /><span>{task.title}</span><small>{task.contact?.name || 'Personal'} · {dateText(task.dueDate)}</small></Link>)}</div></section>}
  </div>;
}
