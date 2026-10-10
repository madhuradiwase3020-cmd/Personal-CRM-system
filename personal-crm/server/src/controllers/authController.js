import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
  return res.status(201).json({ token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect' });
  return res.json({ token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
}

export async function currentUser(req, res) {
  const user = await User.findById(req.userId).select('name email createdAt');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
}

export async function updateProfile(req, res) {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId).select('+password');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ message: 'Name cannot be blank' });
    user.name = name.trim();
  }
  if (email !== undefined) {
    if (!email.trim()) return res.status(400).json({ message: 'Email cannot be blank' });
    user.email = email.trim().toLowerCase();
  }
  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    user.password = await bcrypt.hash(newPassword, 12);
  }
  await user.save();
  return res.json({ token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
}
