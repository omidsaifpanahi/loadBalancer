// server.js
'use strict';

const express = require('express');
const session = require('express-session');
const app     = express();

const CONFIG = require('./config');


// ============================================================================
// Middleware
// ============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 600 * 1000 } // 10 min
}));

app.use(express.static('public'));

app.use('/api', require('./routes/api.routes'));
app.use('/admin', require('./routes/admin.routes'));

app.listen(CONFIG.SERVER_PORT, () => {
  console.log('🚀 Load Balancer Started');
});