'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'DEV-ONLY-change-this-secret-before-deploying';

if (process.env.NODE_ENV === 'production' && SESSION_SECRET.startsWith('DEV-ONLY')) {
  throw new Error('Set a strong SESSION_SECRET environment variable in production.');
}
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], repos: [] }, null, 2));
if (!fs.existsSync(path.join(__dirname, 'sessions'))) fs.mkdirSync(path.join(__dirname, 'sessions'));

let db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
if (!Array.isArray(db.users)) db.users = [];
if (!Array.isArray(db.repos)) db.repos = [];

let writeQueue = Promise.resolve();
function saveDB() {
  const snapshot = JSON.stringify(db, null, 2);
  writeQueue = writeQueue.then(() => fs.promises.writeFile(DATA_FILE + '.tmp', snapshot)
    .then(() => fs.promises.rename(DATA_FILE + '.tmp', DATA_FILE)));
  return writeQueue;
}
const id = () => crypto.randomBytes(12).toString('hex');
const clean = (s, max = 120) => String(s || '').trim().slice(0, max);
const validEmail = s => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(s);
const safeUser = u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt, displayName: u.displayName || '', bio: u.bio || '', location: u.location || '', website: u.website || '', github: u.github || '', skills: Array.isArray(u.skills) ? u.skills : [], avatarUrl: u.avatarUrl || '', followingIds: Array.isArray(u.followingIds) ? u.followingIds : [] });
const publicDeveloper = u => ({ id:u.id, username:u.username, role:u.role, displayName:u.displayName||'', bio:u.bio||'', location:u.location||'', website:u.website||'', github:u.github||'', skills:Array.isArray(u.skills)?u.skills:[], avatarUrl:u.avatarUrl||'', followersCount:db.users.filter(x=>(x.followingIds||[]).includes(u.id)).length, createdAt:u.createdAt });
const safeRepo = r => ({ id: r.id, name: r.name, description: r.description, ownerId: r.ownerId,
  ownerName: r.ownerName, createdAt: r.createdAt, updatedAt: r.updatedAt,
  projectUrl: r.projectUrl || '', projectImageData: r.projectImageData || '',
  files: [] });
function auth(req, res, next) {
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'Sign in required.' });
  req.user = user; next();
}
function developer(req, res, next) {
  if (req.user.role !== 'developer') return res.status(403).json({ error: 'Developer access required.' });
  next();
}
function repoById(req, res, next) {
  const repo = db.repos.find(r => r.id === req.params.repoId);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });
  req.repo = repo; next();
}
function canEdit(req, res) {
  if (req.repo.ownerId !== req.user.id || req.user.role !== 'developer') {
    res.status(403).json({ error: 'Only the repository owner can edit this project.' }); return false;
  }
  return true;
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'], connectSrc: ["'self'"], objectSrc: ["'none'"],
  upgradeInsecureRequests: null
}}}));
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', 1);
app.use(session({
  store: new FileStore({ path: path.join(__dirname, 'sessions'), retries: 0, logFn: () => {} }),
  name: 'codevault.sid', secret: SESSION_SECRET, resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 365 * 24 * 60 * 60 * 1000 }
}));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', limiter);

app.get('/api/me', (req, res) => {
  const user = db.users.find(u => u.id === req.session.userId);
  res.json({ user: user ? safeUser(user) : null });
});

app.post('/api/auth/register', async (req, res) => {
  const username = clean(req.body.username, 24);
  const email = clean(req.body.email, 254).toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role === 'developer' ? 'developer' : 'user';
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return res.status(400).json({ error: 'Username must be 3–24 characters (letters, numbers, underscore).' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid @gmail.com address.' });
  if (password.length < 8 || password.length > 72) return res.status(400).json({ error: 'Password must be 8–72 characters.' });
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: 'This Gmail already has an account.' });
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: 'This username is already taken.' });
  const user = { id: id(), username, email, passwordHash: await bcrypt.hash(password, 12), role, displayName:'', bio:'', location:'', website:'', github:'', skills:[], avatarUrl:'', followingIds:[], createdAt: new Date().toISOString() };
  db.users.push(user); await saveDB();
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Could not start your session. Please try again.' });
    req.session.userId = user.id;
    req.session.save(saveErr => {
      if (saveErr) return res.status(500).json({ error: 'Account created, but session could not be saved. Please sign in.' });
      res.status(201).json({ user: safeUser(user) });
    });
  });
});

app.post('/api/auth/login', async (req, res) => {
  const email = clean(req.body.email, 254).toLowerCase();
  const password = String(req.body.password || '');
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Gmail or password is incorrect.' });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Could not start your session. Please try again.' });
    req.session.userId = user.id;
    req.session.save(saveErr => {
      if (saveErr) return res.status(500).json({ error: 'Sign-in could not be saved. Please try again.' });
      res.json({ user: safeUser(user) });
    });
  });
});

app.patch('/api/profile', auth, async (req, res) => {
  const displayName = clean(req.body.displayName, 60);
  const bio = clean(req.body.bio, 700);
  const location = clean(req.body.location, 80);
  const website = clean(req.body.website, 180);
  const github = clean(req.body.github, 80).replace(/^@/, '');
  const avatarUrl = String(req.body.avatarUrl || '').trim();
  const skills = Array.isArray(req.body.skills) ? [...new Set(req.body.skills.map(x => clean(x, 30)).filter(Boolean))].slice(0, 12) : [];
if (website && !/^https:\/\//i.test(website)) {
  return res.status(400).json({ error: 'Website link must start with https://.' });
}

if (avatarUrl) {
  const isUrl = /^https:\/\/.{1,490}$/i.test(avatarUrl);
  const isImage = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatarUrl);

  if (!isUrl && !isImage) {
    return res.status(400).json({ error: 'Choose a valid avatar image.' });
  }

  if (avatarUrl.length > 400000) {
    return res.status(400).json({ error: 'Avatar image is too large.' });
  }
}
  if (github && !/^[a-zA-Z0-9-]{1,39}$/.test(github)) return res.status(400).json({ error: 'GitHub username is not valid.' });
  Object.assign(req.user, { displayName, bio, location, website, github, avatarUrl, skills });
  await saveDB();
  res.json({ user: safeUser(req.user) });
});

app.get('/api/developers', (req, res) => {
  const q = clean(req.query.q, 100).toLowerCase();
  const developers = db.users.filter(u => u.role === 'developer' && (!q || [u.username,u.displayName,u.bio,...(u.skills||[])].join(' ').toLowerCase().includes(q)))
    .map(publicDeveloper).sort((a,b) => b.followersCount - a.followersCount);
  res.json({ developers });
});
app.get('/api/developers/:developerId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.developerId && u.role === 'developer');
  if (!user) return res.status(404).json({ error: 'Developer not found.' });
  res.json({ developer: publicDeveloper(user), repos: db.repos.filter(r => r.ownerId === user.id).map(safeRepo) });
});
app.post('/api/developers/:developerId/follow', auth, async (req, res) => {
  const target = db.users.find(u => u.id === req.params.developerId && u.role === 'developer');
  if (!target) return res.status(404).json({ error: 'Developer not found.' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'You cannot follow your own profile.' });
  if (!Array.isArray(req.user.followingIds)) req.user.followingIds = [];
  if (!req.user.followingIds.includes(target.id)) req.user.followingIds.push(target.id);
  await saveDB();
  res.json({ followingIds: req.user.followingIds, followersCount: db.users.filter(u => (u.followingIds||[]).includes(target.id)).length });
});
app.delete('/api/developers/:developerId/follow', auth, async (req, res) => {
  req.user.followingIds = (req.user.followingIds || []).filter(id => id !== req.params.developerId);
  await saveDB();
  res.json({ followingIds: req.user.followingIds });
});

app.post('/api/auth/logout', (req, res) => req.session.destroy(() => {
  res.clearCookie('codevault.sid'); res.json({ ok: true });
}));

app.get('/api/repos', (req, res) => {
  const q = clean(req.query.q, 100).toLowerCase();
  const repos = db.repos.filter(r => !q || (r.name + ' ' + r.description + ' ' + r.ownerName).toLowerCase().includes(q))
    .sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ repos: repos.map(safeRepo) });
});
app.post('/api/repos', auth, developer, async (req, res) => {
  const name = clean(req.body.name, 60), description = clean(req.body.description, 500);
  const projectUrl = clean(req.body.projectUrl, 500);
  const projectImageData = String(req.body.projectImageData || '');
  if (!/^[\w .-]{2,60}$/u.test(name)) return res.status(400).json({ error: 'Project name must be 2–60 characters.' });
  if (projectUrl && !/^https:\/\//i.test(projectUrl)) return res.status(400).json({ error: 'Project link must start with https://.' });
  if (projectImageData && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(projectImageData)) return res.status(400).json({ error: 'Choose a valid PNG, JPG, WEBP or GIF image.' });
  if (projectImageData.length > 700000) return res.status(400).json({ error: 'Image is too large. Maximum size is 500 KB.' });
  if (!projectUrl && !projectImageData) return res.status(400).json({ error: 'Add a project link or choose an image.' });
  const repo = { id: id(), name, description, projectUrl, projectImageData, ownerId: req.user.id, ownerName: req.user.username,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), files: [] };
  db.repos.push(repo); await saveDB();
  res.status(201).json({ repo: safeRepo(repo) });
});
app.get('/api/repos/:repoId', repoById, (req, res) => res.json({ repo: safeRepo(req.repo) }));
app.delete('/api/repos/:repoId', auth, developer, repoById, async (req, res) => {
  if (!canEdit(req, res)) return;
  db.repos = db.repos.filter(r => r.id !== req.repo.id); await saveDB(); res.json({ ok: true });
});

  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
  app.listen(PORT, () => console.log(`CodeVault running at http://localhost:${PORT}`));
