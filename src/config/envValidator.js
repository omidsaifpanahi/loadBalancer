'use strict';
// config/envValidator.js

/**
 * Environment Variable Validator
 * Ensures required environment variables are set before server starts
 */

if (!process.env.NODE_ENV) {
    throw new Error('Environment variable NODE_ENV is missing');
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const requiredVars = [
        'SERVER_PORT',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_PASS',
    ];

    requiredVars.forEach((name) => {
        if (!process.env[name]) {
            throw new Error(`Environment variable ${name} is missing`);
        }
    });
}

module.exports = {};