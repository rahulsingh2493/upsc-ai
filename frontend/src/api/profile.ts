import { get, put, ApiError } from './client';
import { EMPTY_PROFILE, type Profile } from '../profile';

const PROFILE_PATH = '/profile';   // becomes /api/v1/profile

function toForm(d: Record<string, unknown> | null): Profile {
  const out = { ...EMPTY_PROFILE };
  (Object.keys(out) as (keyof Profile)[]).forEach((k) => {
    const v = d?.[k];
    out[k] = v == null ? '' : String(v);
  });
  return out;
}

function toApi(p: Profile) {
  const o: Record<string, string | number | null> = {};
  (Object.keys(p) as (keyof Profile)[]).forEach((k) => {
    o[k] = p[k].trim() === '' ? null : p[k].trim();
  });
  o.target_year = p.target_year ? Number(p.target_year) : null;
  return o;
}

export async function getProfile(): Promise<Profile> {
  try {
    return toForm(await get<Record<string, unknown>>(PROFILE_PATH));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { ...EMPTY_PROFILE };
    throw e;
  }
}

export async function saveProfile(p: Profile): Promise<Profile> {
  return toForm(await put<Record<string, unknown>>(PROFILE_PATH, toApi(p)));
}