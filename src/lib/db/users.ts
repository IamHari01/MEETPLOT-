import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  password?: string;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureLocalStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf-8');
  }
}

let memoryCache: User[] | null = null;

export function readLocalUsers(): User[] {
  if (memoryCache) return memoryCache;
  try {
    ensureLocalStoreExists();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    memoryCache = JSON.parse(raw) as User[];
    return memoryCache;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
}

export function writeLocalUsers(users: User[]) {
  memoryCache = users;
  try {
    ensureLocalStoreExists();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Filesystem write blocked (Vercel deployment detected). Using in-memory fallback for users.');
  }
}
