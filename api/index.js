// Vercel Serverless Function Entry Point for Monorepo/Express
// This file bridges the Vercel API environment to our built Express application

// Import the built application (created by npm run build)
const app = require('../dist/index.cjs');

// Vercel expects a function export or an express app
module.exports = app;
