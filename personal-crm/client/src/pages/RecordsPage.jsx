import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDownUp, Building2, CalendarClock, Check, CheckSquare, CirclePlus, Mail, MapPin, MoreHorizontal, NotebookPen, Pencil, Phone, Search, Trash2, UsersRound, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import RecordForm from '../components/RecordForm';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const configs = {
  contacts: { title: 'Your people', subtitle: 'Keep the important people in your life close.', singular: 'contact', icon: UsersRound },
  companies: { title: 'Companies', subtitle: 'Organizations connected to your people and work.', singular: 'company', icon: Building2 },
  interactions: { title: 'Interactions', subtitle: 'A meaningful record of every conversation.', singular: 'interaction', icon: Waypoints },
  tasks: { title: 'Tasks & follow-ups', subtitle: 'A little reminder to show up for someone.', singular: 'task', icon: CheckSquare },
  notes: { title: 'Your notes', subtitle: 'Thoughts, details, and little things worth remembering.', singular: 'note', icon: NotebookPen }
};

function dateLabel(value) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function RecordsPage({ resource }) {
  const config = configs[resource];
  const [records, setRecords] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const location = useLocation();

  const load = async (query = search, status = taskStatus) => {
    setLoading(true);
    setError('');
    try {
      const [items, people, organizations] = await Promise.all([
        api.list(resource, query, status ? { status } : {}),
        resource !== 'contacts' ? api.list('contacts') : Promise.resolve([]),
        resource === 'contacts' ? api.list('companies') : Promise.resolve([])
      ]);
      setRecords(items); setContacts(people); setCompanies(organizations);
    } catch (error) { setError(error.message); toast(error.message, 'error'); } finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(() => load(search, taskStatus), 220); return () => clearTimeout(timer); }, [resource, search, taskStatus, location.key]);

  const options = useMemo(() => ({ contacts, companies }), [contacts, companies]);
  const save = async values => {
    setSaving(true);
    try {
      if (modal.record) await api.update(resource, modal.record._id, values);
      else await api.create(resource, values);
      toast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${modal.record ? 'updated' : 'created'} successfully`);
      setModal(null); await load();
    } catch (error) { toast(error.message, 'error'); } finally { setSaving(false); }
  };
  const remove = async record => {
    if (!window.confirm(`Delete this ${config.singular}? This action cannot be undone.`)) return;
    try { await api.remove(resource, record._id); toast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted`); await load(); }
    catch (error) { toast(error.message, 'error'); }
  };
  const completeTask = async record => {
    try { await api.update('tasks', record._id, { status: record.status === 'Completed' ? 'Pending' : 'Completed' }); toast(record.status === 'Completed' ? 'Task reopened' : 'Task completed'); await load(); }
    catch (error) { toast(error.message, 'error'); }
  };

  const renderMain = record => {
    if (resource === 'contacts') return <div className="person-cell"><span className="avatar avatar-contact">{record.name?.slice(0, 1).toUpperCase()}</span><span><Link className="row-primary" to={`/contacts/${record._id}`}>{record.name}</Link><small>{record.jobTitle || record.relationshipType}</small></span></div>;
    if (resource === 'companies') return <div className="person-cell"><span className="table-icon lavender"><Building2 size={17} /></span><span><strong className="row-primary">{record.name}</strong><small>{record.industry || 'Company'}</small></span></div>;
    if (resource === 'interactions') return <div className="person-cell"><span className="table-icon peach"><Waypoints size={17} /></span><span><strong className="row-primary">{record.type}</strong><small>{record.contact?.name || 'Contact'}</small></span></div>;
    if (resource === 'tasks') return <button className={`task-check ${record.status === 'Completed' ? 'task-check-done' : ''}`} title={record.status === 'Completed' ? 'Reopen task' : 'Complete task'} onClick={() => completeTask(record)}>{record.status === 'Completed' && <Check size={13} />}</button>;
    return <div className="note-title-cell"><span className={`note-swatch note-${record.color || 'violet'}`} /><strong className="row-primary">{record.title}</strong></div>;
  };
  const renderDetail = record => {
    if (resource === 'contacts') return <div className="detail-inline">{record.email && <span><Mail size={14} />{record.email}</span>}{record.phone && <span><Phone size={14} />{record.phone}</span>}</div>;
    if (resource === 'companies') return <span>{record.location || '—'}</span>;
    if (resource === 'interactions') return <span className="clip-text">{record.summary}</span>;
    if (resource === 'tasks') return <span className={record.status === 'Completed' ? 'muted-text' : ''}>{record.title}</span>;
    return <span className="clip-text">{record.content || '—'}</span>;
  };
  const renderMeta = record => {
    if (resource === 'contacts') return record.relationshipType;
    if (resource === 'companies') return record.website ? <a href={record.website.startsWith('http') ? record.website : `https://${record.website}`} target="_blank" rel="noreferrer">{record.website.replace(/^https?:\/\//, '')}</a> : '—';
    if (resource === 'interactions') return dateLabel(record.date);
    if (resource === 'tasks') return <span className={`priority priority-${(record.priority || 'medium').toLowerCase()}`}>{record.priority || 'Medium'}</span>;
    return record.contact?.name || 'Personal';
  };

  return <div className="page-enter">
    <div className="page-heading"><div><span className="eyebrow">YOUR NETWORK</span><h1>{config.title}</h1><p>{config.subtitle}</p></div><button className="button button-primary" onClick={() => setModal({ record: null })}><CirclePlus size={17} /> Add {config.singular}</button></div>
    <section className="panel records-panel">
      <div className="panel-toolbar"><div className="record-count"><span>{records.length}</span> {records.length === 1 ? config.singular : `${config.singular}s`}</div><div className="toolbar-controls">{resource === 'tasks' && <label className="filter-control"><span>Status</span><select aria-label="Filter tasks by status" value={taskStatus} onChange={event => setTaskStatus(event.target.value)}><option value="">All tasks</option><option>Pending</option><option>In progress</option><option>Completed</option></select></label>}<label className="search-box"><Search size={17} /><input aria-label={`Search ${config.title.toLowerCase()}`} placeholder={`Search ${config.title.toLowerCase()}…`} value={search} onChange={event => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label></div></div>
      {loading ? <div className="loading-state"><span className="spinner" /> Loading {config.title.toLowerCase()}…</div> : error ? <ErrorState description={error} onRetry={() => load()} /> : records.length === 0 ? <EmptyState title={search ? 'No matches this time' : `Your ${resource === 'contacts' ? 'people' : config.title.toLowerCase()} are waiting`} description={search ? 'Try a different name or search term.' : `Add a ${config.singular} to start building your personal CRM.`} action={!search && <button className="button button-primary button-small" onClick={() => setModal({ record: null })}><CirclePlus size={15} /> Add {config.singular}</button>} /> :
        resource === 'notes' ? <div className="notes-grid">{records.map(record => <article className={`note-card note-card-${record.color || 'violet'}`} key={record._id}><div className="note-card-top"><span className="note-date">{dateLabel(record.updatedAt)}</span><div className="row-actions"><button title="Edit note" onClick={() => setModal({ record })}><Pencil size={15} /></button><button title="Delete note" onClick={() => remove(record)}><Trash2 size={15} /></button></div></div><h3>{record.title}</h3><p>{record.content || 'An empty note — add a few details.'}</p><div className="note-card-footer"><NotebookPen size={14} /> {record.contact?.name || 'Personal note'}</div></article>)}</div> :
        <div className="table-scroll"><table className="data-table"><thead><tr><th>{resource === 'tasks' ? 'Done' : config.singular === 'company' ? 'Company' : resource === 'interactions' ? 'Type / person' : config.singular === 'note' ? 'Note' : 'Name'}</th><th>{resource === 'contacts' ? 'Contact details' : resource === 'companies' ? 'Location' : resource === 'interactions' ? 'Summary' : resource === 'tasks' ? 'Task' : 'Related to'}</th><th>{resource === 'contacts' ? 'Relationship' : resource === 'companies' ? 'Website' : resource === 'interactions' ? 'Date' : resource === 'tasks' ? 'Priority' : 'Related to'}</th><th>{resource === 'tasks' ? 'Due date' : 'Added'}</th><th><ArrowDownUp size={14} /></th></tr></thead><tbody>{records.map(record => <tr key={record._id}><td>{renderMain(record)}</td><td>{renderDetail(record)}</td><td>{renderMeta(record)}</td><td>{dateLabel(resource === 'tasks' ? record.dueDate : record.createdAt)}</td><td><div className="row-actions"><button title={`Edit ${config.singular}`} onClick={() => setModal({ record })}><Pencil size={15} /></button><button title={`Delete ${config.singular}`} onClick={() => remove(record)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
    </section>
    {modal && <Modal title={`${modal.record ? 'Edit' : 'Add'} ${config.singular}`} onClose={() => setModal(null)} wide><RecordForm resource={resource} initial={modal.record || {}} options={options} onSubmit={save} onCancel={() => setModal(null)} saving={saving} /></Modal>}
  </div>;
}
