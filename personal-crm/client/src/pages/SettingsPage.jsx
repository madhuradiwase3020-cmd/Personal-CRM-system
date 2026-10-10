import { useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const update = async (event, data, setter) => {
    event.preventDefault(); setSaving(true);
    try {
      const result = await api.updateProfile(data);
      updateUser(result.user);
      setProfile({ name: result.user.name, email: result.user.email });
      setter?.({ currentPassword: '', newPassword: '' });
      toast('Your account settings have been saved');
    } catch (error) { toast(error.message, 'error'); } finally { setSaving(false); }
  };
  return <div className="page-enter"><div className="page-heading"><div><span className="eyebrow">YOUR SPACE</span><h1>Settings</h1><p>Make this little corner feel like yours.</p></div></div>
    <div className="settings-layout"><nav className="settings-nav"><a className="settings-nav-active" href="#profile"><UserRound size={17} /> Profile</a><a href="#security"><KeyRound size={17} /> Security</a></nav>
      <div className="settings-content"><section className="panel settings-panel" id="profile"><div className="settings-section-heading"><span className="settings-heading-icon lavender"><UserRound size={18} /></span><div><h2>Personal details</h2><p>How you show up in your workspace.</p></div></div><form onSubmit={event => update(event, profile)}><div className="settings-form-grid"><label className="field"><span>Your name</span><input required value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label><label className="field"><span>Email address</span><input type="email" required value={profile.email} onChange={event => setProfile({ ...profile, email: event.target.value })} /></label></div><div className="form-actions"><button className="button button-primary" disabled={saving}><Save size={16} /> Save changes</button></div></form></section>
      <section className="panel settings-panel" id="security"><div className="settings-section-heading"><span className="settings-heading-icon peach"><KeyRound size={18} /></span><div><h2>Change password</h2><p>Keep your personal workspace secure.</p></div></div><form onSubmit={event => update(event, password, setPassword)}><div className="settings-form-grid"><label className="field"><span>Current password</span><input type="password" required autoComplete="current-password" value={password.currentPassword} onChange={event => setPassword({ ...password, currentPassword: event.target.value })} /></label><label className="field"><span>New password</span><input type="password" minLength={8} required autoComplete="new-password" value={password.newPassword} onChange={event => setPassword({ ...password, newPassword: event.target.value })} /><small>At least 8 characters.</small></label></div><div className="form-actions"><button className="button button-primary" disabled={saving}><KeyRound size={16} /> Update password</button></div></form></section></div>
    </div>
  </div>;
}
