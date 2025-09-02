// backend/server.js
const express = require('express');

// --- garde anti-URL: patch Router/app avant tout ---
// --- garde anti-URL: patch Router/app avant tout ---
const wrapMethods = (obj, label = 'router/app') => {
  const methods = ['use','get','post','put','patch','delete','options','all'];
  methods.forEach((m) => {
    if (typeof obj[m] !== 'function') return;
    const orig = obj[m].bind(obj);

    obj[m] = function (path, ...handlers) {
      const hasFullUrl = (p) => typeof p === 'string' && /^https?:\/\//i.test(p);
      const preview = (v) => typeof v === 'string' ? v : Array.isArray(v) ? JSON.stringify(v) : String(v);

      // 🔊 Log pour voir qui enregistre quoi
      try {
        console.log(`[TRACE] ${label}.${m} ->`, preview(path));
      } catch {}

      let bad = false;
      if (hasFullUrl(path)) bad = true;
      else if (Array.isArray(path) && path.some(hasFullUrl)) bad = true;

      if (bad) {
        const msg = `❌ ${label}.${m}() reçoit une URL complète dans le path: ${preview(path)}`;
        const err = new Error(msg);
        console.error(err.stack || err.message);
        throw err;
      }
      return orig(path, ...handlers);
    };
  });
};
const _Router = express.Router;
express.Router = function (...args) {
  const r = _Router(...args);
  wrapMethods(r, 'router');
  return r;
};
// ---------------------------------------------------

// ---------------------------------------------------

require('dotenv').config();
require('./config/passport');

const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const auth = require('./middlewares/auth');

connectDB();

const app = express();
wrapMethods(app, 'app');
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [ process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost' ];
app.use(cors({ origin: (o,cb)=>(!o||allowedOrigins.includes(o))?cb(null,true):cb(new Error(`Origin ${o} not allowed`)), credentials:true }));
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly:true, sameSite:'lax', secure:false, maxAge:86400000 },
}));

app.use(passport.initialize());
app.use(passport.session());

// Health
app.get('/health', (_req,res)=>res.json({ ok:true }));

// ⚠️ n’active que l’auth pour l’instant
app.use('/api/auth', require('./routes/auth'));

// Les autres routes restent commentées pour isoler
app.use('/api/users', require('./routes/users'));
app.use('/api/articles-public', require('./routes/articlesPublic'));
app.use('/api/articles', auth, require('./routes/articles'));
app.use('/api/collections', auth, require('./routes/collections'));
app.use('/api/feeds', auth, require('./routes/feeds'));

app.use((req,res)=>res.status(404).json({ error:'Route not found' }));
app.use((err,_req,res,_next)=>{ console.error('❌ Error:', err.stack||err); res.status(500).json({ error:'Internal', detail:err.message }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0',()=>console.log(`API on http://0.0.0.0:${PORT}`));
