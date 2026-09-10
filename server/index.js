import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || 'ecosearch';
const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!mongoUri || !jwtSecret) throw new Error('MONGODB_URI and JWT_SECRET must be configured.');

const mongoClient = new MongoClient(mongoUri);
let database;
const authCookieOptions = { httpOnly: true, sameSite: isProduction ? 'strict' : 'lax', secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 };
const publicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email });
const createToken = (user) => jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7d' });

const requireUser = async (req, res, next) => {
  try {
    const token = req.cookies.ecosearch_token;
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const payload = jwt.verify(token, jwtSecret);
    const user = await database.collection('users').findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Authentication required.' });
  }
};

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/products', async (req, res) => {
  const params = new URLSearchParams({
    search_terms: String(req.query.search_terms || ''),
    search_simple: '1',
    action: 'process',
    json: '1',
    tagtype_0: 'labels',
    tag_contains_0: 'contains',
    tag_0: 'organic',
    page: String(req.query.page || '1'),
    page_size: String(req.query.page_size || '12')
  });

  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'EcoSearch-College-Project/1.0' }
    });
    const body = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(body);
  } catch (error) {
    console.error('Open Food Facts proxy error:', error);
    res.status(502).json({ message: 'Unable to reach Open Food Facts.' });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await database.command({ ping: 1 });
    res.json({ ok: true, mongodb: 'connected' });
  } catch {
    res.status(503).json({ ok: false, mongodb: 'disconnected' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!name || !normalizedEmail || !password || password.length < 6) return res.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required.' });
  const users = database.collection('users');
  if (await users.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'User with this email already exists.' });
  const user = { name: String(name).trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date() };
  const result = await users.insertOne(user);
  user._id = result.insertedId;
  res.cookie('ecosearch_token', createToken(user), authCookieOptions);
  return res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  const user = await database.collection('users').findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.cookie('ecosearch_token', createToken(user), authCookieOptions);
  return res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('ecosearch_token', authCookieOptions);
  res.status(204).end();
});
app.get('/api/auth/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/cart', requireUser, async (req, res) => {
  const cart = await database.collection('carts').findOne({ userId: req.user._id });
  res.json({ items: cart?.items || [] });
});
app.put('/api/cart', requireUser, async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  await database.collection('carts').updateOne({ userId: req.user._id }, { $set: { items, updatedAt: new Date() } }, { upsert: true });
  res.json({ items });
});

const start = async () => {
  await mongoClient.connect();
  database = mongoClient.db(databaseName);
  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database.collection('carts').createIndex({ userId: 1 }, { unique: true });
  app.listen(port, () => console.log(`EcoSearch API listening on http://localhost:${port}`));
};
start().catch((error) => { console.error('Unable to start API:', error); process.exit(1); });