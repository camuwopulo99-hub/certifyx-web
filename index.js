'use strict';
// Vercel Node.js Function adapter for the existing zero-dependency HTTP server.
// Vercel's filesystem is read-only; writable runtime data can only live in /tmp
// and is ephemeral. Use a persistent database/object store for production data.
process.env.DATA_DIR = process.env.DATA_DIR || '/tmp/certifyx-data';
const server = require('../server');
module.exports = function handler(req, res) {
  server.emit('request', req, res);
};
