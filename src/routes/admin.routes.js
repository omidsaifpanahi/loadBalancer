const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');

const CONFIG = require("../config");
const requireAuth = require('./middleware/requireAuth');
const redisService = require('./utilities/redisService').getInstance();
const stateManagement = require('./stateManagement');

router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    const isValid = await bcrypt.compare(password, CONFIG.ADMIN_PASSWORD_HASH);

    if (isValid) {
      req.session.isAdmin = true;
      console.log('✅ Admin logged in');
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/status', (req, res) => {
  res.json({
    isLoggedIn: req.session && req.session.isAdmin === true
  });
});

router.get('/servers', requireAuth, async (req, res) => {
  const servers = await redisService.getAliveServers();
  res.json({
    servers,
    currentStrategy : stateManagement.currentStrategy,
    stats: stateManagement.strategyStats,
    totalServers: servers.length,
    totalPeers: servers.reduce((sum, s) => sum + s.totalPeers, 0),
    totalRooms: servers.reduce((sum, s) => sum + s.roomCount, 0)
  });
});

router.post('/strategy', requireAuth, (req, res) => {
  const { strategy } = req.body;

  const validStrategies = ['leastPeers', 'leastRooms', 'roundRobin', 'random'];

  if (!validStrategies.includes(strategy)) {
    return res.status(400).json({
      error: 'Invalid strategy',
      validStrategies
    });
  }

  const oldStrategy = stateManagement.currentStrategy;
  stateManagement.currentStrategy = strategy;
  stateManagement.roundRobinIndex = 0; // reset round-robin

  console.log(`🔄 Strategy changed: ${oldStrategy} → ${strategy}`);

  res.json({
    success: true,
    oldStrategy,
    newStrategy: strategy,
    message: `Strategy changed to ${strategy}`
  });
});

router.get('/stats', requireAuth, async (req, res) => {
  const servers = await redisService.getAliveServers();

  res.json({
    currentStrategy : stateManagement.currentStrategy,
    strategyStats : stateManagement.strategyStats,
    servers: {
      total: servers.length,
      totalPeers: servers.reduce((sum, s) => sum + s.totalPeers, 0),
      totalRooms: servers.reduce((sum, s) => sum + s.roomCount, 0),
      list: servers.map(s => ({
        id: s.id,
        peers: s.totalPeers,
        rooms: s.roomCount,
        lastSeen: Math.floor(s.timeSinceHeartbeat / 1000) + 's ago'
      }))
    }
  });
});