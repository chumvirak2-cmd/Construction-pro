const functions = require('firebase-functions');
const express = require('express');
const { createServer } = require('http');
const { NextServer } = require('next/dist/server/next-server');
const path = require('path');

const app = express();
const isDev = process.env.NODE_ENV === 'development';

// Initialize Next.js in standalone mode
const nextApp = new NextServer({
  dir: path.join(__dirname, '..'),
  dev: isDev,
  customServer: true,
})

const handle = nextApp.getRequestHandler();

app.all('*', (req, res) => {
  return handle(req, res);
});

// Export Cloud Function
exports.next = functions.https.onRequest(app);
