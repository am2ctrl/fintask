// Vercel Serverless Function Handler
// This file imports the Express handler from the built server

const path = require('path');

// Import the built server handler
const serverPath = path.join(__dirname, '..', 'dist', 'index.cjs');
const handler = require(serverPath);

// Export the handler for Vercel
module.exports = handler;
