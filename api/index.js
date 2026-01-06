// Vercel Serverless Function Handler
// This file wraps the Express app for Vercel's serverless environment

const path = require('path');
const express = require('express');

// Cache the app instance
let cachedApp = null;

async function getApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Try to require the built server
    const serverPath = path.join(__dirname, '..', 'dist', 'index.cjs');
    const serverModule = require(serverPath);

    // The module exports the Express app
    cachedApp = serverModule;

    if (!cachedApp || typeof cachedApp !== 'function') {
      throw new Error('Server module did not export a valid Express app');
    }

    console.log('Express app loaded successfully');
    return cachedApp;
  } catch (error) {
    console.error('Failed to load Express app:', error);

    // Return a fallback error handler
    const fallbackApp = express();
    fallbackApp.all('*', (req, res) => {
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to initialize server',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    });

    return fallbackApp;
  }
}

// Export the Vercel serverless function handler
module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
