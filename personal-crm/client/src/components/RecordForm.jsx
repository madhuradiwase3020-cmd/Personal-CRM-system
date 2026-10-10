import { useEffect, useState } from 'react';

const fields = {
  contacts: [
    { name: 'name', label: 'Full name', required: true, placeholder: 'e.g. Alex Morgan' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'alex@example.com' },
    { name: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
    { name: 'company', label: 'Company', type: 'company' },
    { name: 'jobTitle', label: 'Job title', placeholder: 'Product designer' },
    { name: 'location', label: 'Location', placeholder: 'Brooklyn, NY' },
    { name: 'birthday', label: 'Birthday', type: 'date' },
    { name: 'website', label: 'Website', placeholder: 'https://example.com' },
    { name: 'relationshipType', label: 'Relationship', type: 'select', defaultValue: 'Professional', options: ['Friend', 'Family', 'College', 'HR / Recruiter', 'Client', 'Customer', 'Colleague', 'Professional', 'Other'] },
    { name: 'tags', label: 'Tags', placeholder: 'Design, Mentorship, Running', hint: 'Separate tags with commas' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'What would be helpful to remember?' }
  ],
  companies: [
    { name: 'name', label: 'Company name', required: true, placeholder: 'Company name' },
    { name: 'industry', label: 'Industry', placeholder: 'Technology' },
    { name: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
    { name: 'website', label: 'Website', placeholder: 'https://company.com' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'A little context about this company' }
  ],
  interactions: [
    { name: 'contact', label: 'Contact', type: 'contact', required: true },
    { name: 'type', label: 'Type', type: 'select', defaultValue: 'Meeting', options: ['Call', 'Meeting', 'Email', 'Message', 'Event', 'Other'] },
    { name: 'date', label: 'Date', type: 'datetime-local', required: true },
    { name: 'nextFollowUp', label: 'Next follow-up', type: 'date' },
    { name: 'summary', label: 'What happened?', type: 'textarea', required: true, full: true, placeholder: 'Capture the important details...' }
  ],
  tasks: [
    { name: 'title', label: 'Task', required: true, placeholder: 'Send a note to Alex' },
    { name: 'contact', label: 'Related contact', type: 'contact' },
    { name: 'dueDate', label: 'Due date', type: 'date' },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In progress', 'Completed'] },
    { name: 'description', label: 'Details', type: 'textarea', full: true, placeholder: 'A few details to help you follow through' }
  ],
  notes: [
    { name: 'title', label: 'Title', required: true, placeholder: 'A thought to remember' },
    { name: 'contact', label: 'Related contact', type: 'contact' },
    { name: 'color', label: 'Color', type: 'select', options: ['violet', 'blue', 'green', 'amber'] },
    { name: 'content', label: 'Note', type: 'textarea', full: true, placeholder: 'Write down the details...' }
  ]
};
const recordLabels = { contacts: 'contact', companies: 'company', interactions: 'interaction', tasks: 'task', notes: 'note' };

function toLocalValue(value, type) {
  if (!value) return '';
  const date = new Date(value);
  if (type === 'datetime-local') return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  if (type === 'date') return date.toISOString().slice(0, 10);
  return value;
}

export default function RecordForm({ resource, initial = {}, options = {}, onSubmit, onCancel, saving }) {
  const [values, setValues] = useState({});
  useEffect(() => {
    const initialValues = {};
    (fields[resource] || []).forEach(field => {
      let value = initial[field.name] ?? field.defaultValue ?? (field.type === 'select' ? field.options[0] : '');
      if (field.name === 'company' || field.name === 'contact') value = value?._id || value || '';
      if (field.name === 'tags' && Array.isArray(value)) value = value.join(', ');
      initialValues[field.name] = toLocalValue(value, field.type);
    });
    setValues(initialValues);
  }, [resource, initial]);

  const handleSubmit = event => {
    event.preventDefault();
    const body = { ...values };
    if (resource === 'contacts') body.tags = (values.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
    if (resource === 'interactions') {
      if (body.date) body.date = new Date(body.date).toISOString();
      if (!body.nextFollowUp) body.nextFollowUp = null;
    }
    ['birthday', 'dueDate', 'nextFollowUp'].forEach(key => { if (body[key] === '') body[key] = null; });
    ['company', 'contact'].forEach(key => { if (body[key] === '') body[key] = null; });
    onSubmit(body);
  };
  return <form className="record-form" onSubmit={handleSubmit}>
    <div className="form-grid">
      {(fields[resource] || []).map(field => <label className={`field ${field.full ? 'field-full' : ''}`} key={field.name}>
        <span>{field.label}{field.required && <b className="required-mark"> *</b>}</span>
        {field.type === 'textarea' ? <textarea rows="4" required={field.required} value={values[field.name] || ''} placeholder={field.placeholder} onChange={event => setValues({ ...values, [field.name]: event.target.value })} />
          : field.type === 'select' ? <select value={values[field.name] || field.options[0]} onChange={event => setValues({ ...values, [field.name]: event.target.value })}>{field.options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select>
            : field.type === 'contact' || field.type === 'company' ? <select required={field.required} value={values[field.name] || ''} onChange={event => setValues({ ...values, [field.name]: event.target.value })}>
              <option value="">{field.type === 'contact' ? 'Choose a contact' : 'No company'}</option>
              {(field.type === 'contact' ? options.contacts : options.companies)?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
              : <input type={field.type || 'text'} required={field.required} value={values[field.name] || ''} placeholder={field.placeholder} onChange={event => setValues({ ...values, [field.name]: event.target.value })} />}
        {field.hint && <small>{field.hint}</small>}
      </label>)}
    </div>
    <footer className="form-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : initial._id ? 'Save changes' : `Create ${recordLabels[resource]}`}</button></footer>
  </form>;
}
