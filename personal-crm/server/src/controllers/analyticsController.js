import Contact from '../models/Contact.js';
import Company from '../models/Company.js';
import Interaction from '../models/Interaction.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

export async function dashboard(req, res) {
  const owner = req.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [totalContacts, totalCompanies, pendingTasks, upcomingFollowUps, upcomingInteractions, todayInteractions, recentInteractions, recentContacts, dueTasks] = await Promise.all([
    Contact.countDocuments({ owner }),
    Company.countDocuments({ owner }),
    Task.countDocuments({ owner, status: { $ne: 'Completed' } }),
    Interaction.countDocuments({ owner, nextFollowUp: { $gte: today } }),
    Interaction.find({ owner, nextFollowUp: { $gte: today } }).sort({ nextFollowUp: 1 }).limit(5).populate('contact', 'name'),
    Interaction.find({ owner, nextFollowUp: { $gte: today, $lt: tomorrow } }).sort({ nextFollowUp: 1 }).populate('contact', 'name'),
    Interaction.find({ owner }).sort({ date: -1 }).limit(6).populate('contact', 'name'),
    Contact.find({ owner }).sort({ createdAt: -1 }).limit(5).populate('company', 'name'),
    Task.find({ owner, status: { $ne: 'Completed' }, dueDate: { $gte: today } }).sort({ dueDate: 1 }).limit(5).populate('contact', 'name')
  ]);
  return res.json({ totalContacts, totalCompanies, pendingTasks, upcomingFollowUps, upcomingInteractions, todayFollowUps: todayInteractions, recentInteractions, recentContacts, dueTasks });
}

export async function reports(req, res) {
  const owner = req.userId;
  const ownerId = new mongoose.Types.ObjectId(owner);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [contactsByRelationship, interactionsByType, tasksByStatus, monthlyInteractions, counts] = await Promise.all([
    Contact.aggregate([{ $match: { owner: ownerId } }, { $group: { _id: '$relationshipType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Interaction.aggregate([{ $match: { owner: ownerId } }, { $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Task.aggregate([{ $match: { owner: ownerId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Interaction.countDocuments({ owner, date: { $gte: monthStart } }),
    Promise.all([Contact.countDocuments({ owner }), Interaction.countDocuments({ owner }), Task.countDocuments({ owner })])
  ]);
  return res.json({ contactsByRelationship, interactionsByType, tasksByStatus, interactionsThisMonth: monthlyInteractions, totalContacts: counts[0], totalInteractions: counts[1], totalTasks: counts[2] });
}
