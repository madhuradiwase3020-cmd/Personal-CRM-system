import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, Plus, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import RecordForm from '../components/RecordForm';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const dateKey = value => value ? new Date(value).toLocaleDateString() : '';
const readableDate = value => value ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(value)) : 'No date set';

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [taskList, interactionList, people] = await Promise.all([api.list('tasks'), api.list('interactions'), api.list('contacts')]);
      setTasks(taskList.filter(task => task.dueDate && task.status !== 'Completed'));
      setInteractions(interactionList.filter(item => item.nextFollowUp));
      setContacts(people);
    } catch (error) { setError(error.message); toast(error.message, 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const events = useMemo(() => [
    ...tasks.map(task => ({ id: task._id, title: task.title, person: task.contact?.name || 'Personal task', date: task.dueDate, kind: 'task', status: task.status })),
    ...interactions.map(item => ({ id: item._id, title: `Follow up: ${item.summary}`, person: item.contact?.name || 'A contact', date: item.nextFollowUp, kind: 'followup', type: item.type }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date)), [tasks, interactions]);
  const groups = events.reduce((result, event) => {
    const key = dateKey(event.date);
    result[key] = result[key] || [];
    result[key].push(event);
    return result;
  }, {});
  const complete = async event => {
    if (event.kind !== 'task') return;
    try { await api.update('tasks', event.id, { status: 'Completed' }); toast('Task completed — nice follow-through!'); await load(); }
    catch (error) { toast(error.message, 'error'); }
  };
  const save = async values => {
    setSaving(true);
    try { await api.create('tasks', values); setModal(null); toast('Follow-up added to your calendar'); await load(); }
    catch (error) { toast(error.message, 'error'); } finally { setSaving(false); }
  };
  return <div className="page-enter"><div className="page-heading"><div><span className="eyebrow">MAKE THE MOMENT</span><h1>Calendar</h1><p>A little nudge to keep your connections warm.</p></div><button className="button button-primary" onClick={() => setModal(true)}><Plus size={17} /> Add follow-up</button></div>
    <div className="calendar-intro panel"><span className="calendar-art"><CalendarDays size={25} /></span><div><span className="eyebrow">YOUR UPCOMING MOMENTS</span><h2>{events.length ? `${events.length} things to look forward to` : 'A fresh page'}</h2><p>Tasks and planned check-ins appear here, in date order.</p></div><div className="calendar-month">{new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date())}</div></div>
    {loading ? <div className="loading-state"><span className="spinner" /> Loading your calendar…</div> : error ? <ErrorState description={error} onRetry={load} /> : !events.length ? <section className="panel calendar-empty"><EmptyState title="Your calendar is open" description="Add a task or schedule a follow-up to make space for the people you care about." action={<button className="button button-primary button-small" onClick={() => setModal(true)}><Plus size={15} /> Add a follow-up</button>} /></section> : <div className="calendar-groups">{Object.entries(groups).map(([key, items]) => <section className="calendar-day" key={key}><div className="calendar-day-heading"><span className="calendar-day-number">{new Date(items[0].date).getDate()}</span><div><strong>{readableDate(items[0].date)}</strong><small>{items.length} planned {items.length === 1 ? 'moment' : 'moments'}</small></div></div><div className="calendar-events">{items.map(item => <article className={`calendar-event ${item.kind}`} key={`${item.kind}-${item.id}`}><span className="event-kind-icon">{item.kind === 'task' ? <Check size={16} /> : <Waypoints size={16} />}</span><div className="event-info"><strong>{item.title}</strong><p>{item.person} · {item.kind === 'task' ? 'Task' : `${item.type} follow-up`}</p></div><span className="event-time"><Clock3 size={14} /> {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(item.date))}</span>{item.kind === 'task' && <button className="button button-small button-quiet" onClick={() => complete(item)}>Complete</button>}</article>)}</div></section>)}</div>}
    {modal && <Modal title="Add a follow-up task" onClose={() => setModal(false)} wide><RecordForm resource="tasks" initial={{ priority: 'Medium', status: 'Pending' }} options={{ contacts }} onSubmit={save} onCancel={() => setModal(false)} saving={saving} /></Modal>}
  </div>;
}
