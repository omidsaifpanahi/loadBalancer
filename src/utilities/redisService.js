// file_path: utilities/redisService.js
'use strict';

const Redis = require('ioredis');
const logger = require('./logger');
const { REDIS} = require('../config');

let instance = null;

class RedisService {
  constructor() {
    if (instance) return instance; // Singleton pattern

    const baseConfig = {
      host: REDIS.host,
      port: REDIS.port,
      password: REDIS.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true // prevents auto connection
    };
    this.redisClient = new Redis(baseConfig);

    this.setupErrorHandlers();

    instance = this;
  }

  setupErrorHandlers() {
    this.errorHandler = (err) => logger.error('Redis error', { error: err?.message || err });
    this.connectHandler = () => logger.info('Redis connected');
    this.reconnectingHandler = () => logger.warn('Redis reconnecting');

    let client = this.redisClient;
    client.on('error', this.errorHandler);
    client.on('connect', this.connectHandler);
    client.on('reconnecting', this.reconnectingHandler);

  }

  removeErrorHandlers() {
    let client = this.redisClient;
    client.off('error', this.errorHandler);
    client.off('connect', this.connectHandler);
    client.off('reconnecting', this.reconnectingHandler);
  }

  async connect() {
    let client = this.redisClient;
      if (client.status === 'ready' || client.status === 'connecting') {
        logger.debug(`Redis client already ${client.status}`);
      }

      try {
        await client.connect();
      } catch (err) {
        if (err.message.includes('already connecting')) {
          logger.debug('Redis is already connecting, skipping reconnect.');
        } else {
          logger.error('Redis connect failed', { error: err.message });
          throw err;
        }
      }
  }

  async getAliveServers() {
    try {
      const keys = await redis.keys('server:*');
      const servers = [];
      const now = Date.now();

      for (const key of keys) {
        if (key.includes(':rooms') || key.includes(':totalPeers')) {
          continue;
        }

        const data = await redis.get(key);
        if (!data) continue;

        let serverInfo;
        try {
          serverInfo = JSON.parse(data);
        } catch {
          continue;
        }

        const timeSinceHeartbeat = now - serverInfo.lastHeartbeat;

        // فقط سرورهای زنده
        if (timeSinceHeartbeat < CONFIG.SERVER_TIMEOUT) {
          const serverId = key.replace('server:', '');

          // دریافت تعداد اتاق‌ها و پیرها از Redis
          const roomKeys = await redis.keys(`room:*:totalPeers:${serverId}`);
          let totalPeers = 0;

          for (const roomKey of roomKeys) {
            const peerCount = await redis.get(roomKey);
            totalPeers += parseInt(peerCount || 0);
          }

          servers.push({
            id: serverId,
            ip: serverInfo.ip,
            port: serverInfo.port,
            totalPeers: totalPeers,
            roomCount: roomKeys.length,
            lastHeartbeat: serverInfo.lastHeartbeat,
            timeSinceHeartbeat,
            status: serverInfo.status || 'online',
            url: `https://${serverInfo.ip}:${serverInfo.port}`
          });
        }
      }

      return servers;
    } catch (err) {
      console.error('Error getting alive servers:', err);
      return [];
    }
  }
}

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new RedisService();
    }
    return instance;
  },
  RedisService
};