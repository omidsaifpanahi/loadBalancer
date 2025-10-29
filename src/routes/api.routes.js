const express = require('express');
const router = express.Router();

const stateManagement = require("../stateManagement");

const redisService = require('./utilities/redisService').getInstance();
const helpers = require('./helpers');
const stateManagement = require('./stateManagement');

router.get('/server', async (req, res) => {
  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    const servers = await redisService.getAliveServers();

    if (servers.length === 0) {
      return res.status(503).json({
        error: 'No servers available',
        message: 'هیچ سروری در دسترس نیست'
      });
    }

    const currentStrategy  = stateManagement.currentStrategy;
    const selectedServer = helpers.selectServer(servers, currentStrategy);

    console.log(`📍 Client requested server for room ${roomId} - Selected: ${selectedServer.id} (${currentStrategy})`);

    res.json({
      success: true,
      server: {
        id: selectedServer.id,
        url: selectedServer.url,
        ip: selectedServer.ip,
        port: selectedServer.port
      },
      strategy: currentStrategy,
      availableServers: servers.length
    });
  } catch (err) {
    console.error('Error in /api/server:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/health', async (req, res) => {
  const servers = await redisService.getAliveServers();
  res.json({
    status: 'ok',
    loadBalancer: 'running',
    availableServers: servers.length,
    currentStrategy: stateManagement.currentStrategy,
    uptime: process.uptime()
  });
});