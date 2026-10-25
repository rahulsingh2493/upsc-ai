import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, saveProfile } from '../api/profile';
import {
  EDUCATION_LEVELS, EMPTY_PROFILE, GENDERS, MEDIUMS, OPTIONAL_SUBJECTS, type Profile,
} from '../profile';

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => String(thisYear + i));
const today = new Date().toISOString().slice(0, 10);

function Options({ items }: { items: string[] }) {
  return (<><option value="">Select</option>{items.map((i) => <option key={i} value={i}>{i}</option>)}</>);
}

export default function SettingsPage() {
  const [form, setForm] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setForm)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof Profile) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSaved(false);
    if (!form.first_name.trim() || !form.last_name.trim()) return setError('First name and last name are required.');
    if (!form.target_year) return setError('Select your target year.');
    setSaving(true);
    try {
      setForm(await saveProfile(form));
      setSaved(true);
    } catch (ex) {
      setError((ex as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="settings">
      <div className="settings-card">
        <Link to="/" className="back">&larr; Back to chat</Link>
        <h1>Preferences</h1>
        <p className="sub">This helps UPSC Desk tailor answers to your preparation.</p>

        {loading ? <p>Loading...</p> : (
          <form onSubmit={submit} noValidate>
            <div className="grid">
              <div><label htmlFor="first_name">First name *</label>
                <input id="first_name" className="field" value={form.first_name} onChange={set('first_name')} autoComplete="given-name" /></div>
              <div><label htmlFor="middle_name">Middle name</label>
                <input id="middle_name" className="field" value={form.middle_name} onChange={set('middle_name')} autoComplete="additional-name" /></div>
              <div><label htmlFor="last_name">Last name *</label>
                <input id="last_name" className="field" value={form.last_name} onChange={set('last_name')} autoComplete="family-name" /></div>
              <div><label htmlFor="gender">Gender</label>
                <select id="gender" className="field" value={form.gender} onChange={set('gender')}><Options items={GENDERS} /></select></div>
              <div><label htmlFor="dob">Date of birth</label>
                <input id="dob" type="date" max={today} className="field" value={form.dob} onChange={set('dob')} /></div>
              <div><label htmlFor="target_year">Target year *</label>
                <select id="target_year" className="field" value={form.target_year} onChange={set('target_year')}><Options items={YEARS} /></select></div>
              <div><label htmlFor="education_level">Highest education</label>
                <select id="education_level" className="field" value={form.education_level} onChange={set('education_level')}><Options items={EDUCATION_LEVELS} /></select></div>
              <div><label htmlFor="field_of_study">Degree or field of study</label>
                <input id="field_of_study" className="field" value={form.field_of_study} onChange={set('field_of_study')} /></div>
              <div className="full"><label htmlFor="institution">College or university</label>
                <input id="institution" className="field" value={form.institution} onChange={set('institution')} /></div>
              <div><label htmlFor="optional_subject">Optional subject</label>
                <select id="optional_subject" className="field" value={form.optional_subject} onChange={set('optional_subject')}><Options items={OPTIONAL_SUBJECTS} /></select></div>
              <div><label htmlFor="medium">Medium</label>
                <select id="medium" className="field" value={form.medium} onChange={set('medium')}><Options items={MEDIUMS} /></select></div>
            </div>
            <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save preferences'}</button>
            <div className="err" role="alert">{error}</div>
            {saved && <div className="ok" role="status">Preferences saved.</div>}
          </form>
        )}
      </div>
    </main>
  );
}