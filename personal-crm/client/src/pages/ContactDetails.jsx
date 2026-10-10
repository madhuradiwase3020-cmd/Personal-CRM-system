import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Globe2, Mail, MapPin, Pencil, Phone, Plus, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import RecordForm from '../components/RecordForm';
import ErrorState from '../components/ErrorState';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function ContactDetails() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [person, history, contactTasks, orgs] = await Promise.all([api.get('contacts', id), api.list('interactions', '', { contact: id }), api.list('tasks', '', { contact: id }), api.list('companies')]);
      setContact(person); setInteractions(history); setTasks(contactTasks); setCompanies(orgs);
    } catch (error) { setError(error.message); toast(error.message, 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);
  const save = async value => {
    setBusy(true);
    try {
      if (modal.kind === 'edit') await api.update('contacts', id, value);
      else await api.create(modal.kind === 'interaction' ? 'interactions' : 'tasks', { ...value, contact: id });
      toast(modal.kind === 'edit' ? 'Contact details updated' : `${modal.kind === 'interaction' ? 'Interaction' : 'Follow-up'} added`);
      setModal(null); await load();
    } catch (error) { toast(error.message, 'error'); } finally { setBusy(false); }
  };
  if (loading && !contact) return <div className="loading-page"><span className="spinner" /> Loading contact…</div>;
  if (error) return <div className="page-enter"><ErrorState description={error} onRetry={load} /></div>;
  if (!contact) return <div className="loading-page"><span className="spinner" /> Loading contact…</div>;
  return <div className="page-enter">
    <Link to="/contacts" className="back-link"><ArrowLeft size={16} /> Back to people</Link>
    <section className="contact-hero panel"><div className="contact-hero-main"><span className="avatar avatar-xl">{contact.name?.slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">{contact.relationshipType || 'CONTACT'}</span><h1>{contact.name}</h1><p>{contact.jobTitle || 'A person in your circle'}{contact.company?.name ? ` at ${contact.company.name}` : ''}</p><div className="tag-list">{contact.tags?.map(tag => <span className="tag-chip" key={tag}>{tag}</span>)}</div></div></div><div className="contact-hero-actions"><button className="button button-quiet" onClick={() => setModal({ kind: 'edit' })}><Pencil size={16} /> Edit contact</button><button className="button button-primary" onClick={() => setModal({ kind: 'interaction' })}><Plus size={16} /> Log interaction</button><button className="button button-soft" onClick={() => setModal({ kind: 'task' })}><CalendarDays size={16} /> Add follow-up</button></div></section>
    <div className="contact-detail-grid"><section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">THE DETAILS</span><h2>Getting to know {contact.name?.split(' ')[0]}</h2></div></div><div className="contact-facts">
      <div><span className="fact-icon lavender"><Mail size={16} /></span><span><small>Email</small><strong>{contact.email || 'Not added yet'}</strong></span></div>
      <div><span className="fact-icon mint"><Phone size={16} /></span><span><small>Phone</small><strong>{contact.phone || 'Not added yet'}</strong></span></div>
      <div><span className="fact-icon peach"><Building2 size={16} /></span><span><small>Company</small><strong>{contact.company?.name || 'Not added yet'}</strong></span></div>
      <div><span className="fact-icon blue"><MapPin size={16} /></span><span><small>Location</small><strong>{contact.location || 'Not added yet'}</strong></span></div>
      <div><span className="fact-icon amber"><CalendarDays size={16} /></span><span><small>Birthday</small><strong>{formatDate(contact.birthday)}</strong></span></div>
      <div><span className="fact-icon lavender"><Globe2 size={16} /></span><span><small>Website</small><strong>{contact.website ? <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noreferrer">{contact.website}</a> : 'Not added yet'}</strong></span></div>
    </div><div className="contact-notes"><span className="eyebrow">A NOTE TO YOURSELF</span><p>{contact.notes || 'No personal notes for this contact yet.'}</p></div></section>
    <section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR HISTORY</span><h2>Recent interactions</h2></div><button className="icon-button add-icon" aria-label="Add interaction" onClick={() => setModal({ kind: 'interaction' })}><Plus size={18} /></button></div>
      {!interactions.length ? <div className="detail-empty"><Waypoints size={20} /><p>Keep the story going by logging your first conversation.</p><button className="text-link" onClick={() => setModal({ kind: 'interaction' })}>Log an interaction <Plus size={14} /></button></div> : <div className="timeline">{interactions.map(item => <article className="timeline-item" key={item._id}><span className="timeline-dot" /><div><div className="timeline-top"><strong>{item.type}</strong><span>{formatDate(item.date)}</span></div><p>{item.summary}</p>{item.nextFollowUp && <small className="followup-chip"><CalendarDays size={13} /> Follow up {formatDate(item.nextFollowUp)}</small>}</div></article>)}</div>}
      <div className="panel-divider" /><div className="panel-heading compact-heading"><div><span className="eyebrow">NEXT STEPS</span><h2>Follow-ups</h2></div><button className="text-link" onClick={() => setModal({ kind: 'task' })}>Add one <Plus size={14} /></button></div>
      {!tasks.length ? <p className="quiet-copy">Nothing on the list yet. The best time to reach out is often now.</p> : tasks.map(task => <div className="contact-task" key={task._id}><span className={`task-preview-dot ${task.status === 'Completed' ? 'done-dot' : ''}`} /><span>{task.title}</span><small>{formatDate(task.dueDate)}</small></div>)}
    </section></div>
    {modal && <Modal title={modal.kind === 'edit' ? 'Edit contact' : modal.kind === 'interaction' ? 'Log an interaction' : 'Create a follow-up'} onClose={() => setModal(null)} wide><RecordForm resource={modal.kind === 'edit' ? 'contacts' : modal.kind === 'interaction' ? 'interactions' : 'tasks'} initial={modal.kind === 'edit' ? contact : modal.kind === 'interaction' ? { contact: id, date: new Date().toISOString(), type: 'Meeting' } : { contact: id, priority: 'Medium', status: 'Pending' }} options={{ contacts: [contact], companies }} onSubmit={save} onCancel={() => setModal(null)} saving={busy} /></Modal>}
  </div>;
}
