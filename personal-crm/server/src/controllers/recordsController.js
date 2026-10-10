import Contact from '../models/Contact.js';
import Company from '../models/Company.js';
import Interaction from '../models/Interaction.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';

const relatedModels = {
  contacts: { company: Company },
  interactions: { contact: Contact },
  tasks: { contact: Contact },
  notes: { contact: Contact }
};

const resources = {
  contacts: { model: Contact, populate: { path: 'company', select: 'name' } },
  companies: { model: Company },
  interactions: { model: Interaction, populate: [{ path: 'contact', select: 'name email' }] },
  tasks: { model: Task, populate: [{ path: 'contact', select: 'name' }] },
  notes: { model: Note, populate: [{ path: 'contact', select: 'name' }] }
};

function resourceFor(req, res) {
  const resource = resources[req.params.resource];
  if (!resource) {
    res.status(404).json({ message: 'Resource not found' });
    return null;
  }
  return resource;
}

function populateQuery(query, populate) {
  return populate ? query.populate(populate) : query;
}

async function validateReferences(resourceName, body, owner) {
  const relations = relatedModels[resourceName] || {};
  for (const [field, Model] of Object.entries(relations)) {
    if (body[field] && !(await Model.exists({ _id: body[field], owner }))) {
      return `${field === 'company' ? 'Company' : 'Contact'} not found`;
    }
  }
  return null;
}

export async function listRecords(req, res) {
  const resource = resourceFor(req, res);
  if (!resource) return;
  const filter = { owner: req.userId };
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const searchable = {
      contacts: ['name', 'email', 'phone', 'jobTitle', 'location', 'relationshipType', 'tags'],
      companies: ['name', 'industry', 'location'],
      interactions: ['type', 'summary'],
      tasks: ['title', 'description', 'status', 'priority'],
      notes: ['title', 'content']
    }[req.params.resource];
    filter.$or = searchable.map(field => ({ [field]: regex }));
  }
  if (req.query.status && req.params.resource === 'tasks') filter.status = req.query.status;
  if (req.query.contact && ['interactions', 'tasks', 'notes'].includes(req.params.resource)) filter.contact = req.query.contact;
  const query = resource.model.find(filter).sort({ createdAt: -1 });
  return res.json(await populateQuery(query, resource.populate));
}

export async function getRecord(req, res) {
  const resource = resourceFor(req, res);
  if (!resource) return;
  const query = resource.model.findOne({ _id: req.params.id, owner: req.userId });
  const record = await populateQuery(query, resource.populate);
  if (!record) return res.status(404).json({ message: 'Record not found' });
  return res.json(record);
}

export async function createRecord(req, res) {
  const resource = resourceFor(req, res);
  if (!resource) return;
  const referenceError = await validateReferences(req.params.resource, req.body, req.userId);
  if (referenceError) return res.status(404).json({ message: referenceError });
  const record = await resource.model.create({ ...req.body, owner: req.userId });
  const query = resource.model.findById(record.id);
  return res.status(201).json(await populateQuery(query, resource.populate));
}

export async function updateRecord(req, res) {
  const resource = resourceFor(req, res);
  if (!resource) return;
  const { owner, _id, __v, ...updates } = req.body;
  const referenceError = await validateReferences(req.params.resource, updates, req.userId);
  if (referenceError) return res.status(404).json({ message: referenceError });
  const record = await resource.model.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!record) return res.status(404).json({ message: 'Record not found' });
  const query = resource.model.findById(record.id);
  return res.json(await populateQuery(query, resource.populate));
}

export async function deleteRecord(req, res) {
  const resource = resourceFor(req, res);
  if (!resource) return;
  const record = await resource.model.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!record) return res.status(404).json({ message: 'Record not found' });
  return res.json({ message: 'Record deleted' });
}
