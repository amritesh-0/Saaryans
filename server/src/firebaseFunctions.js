/**
 * Firebase Cloud Functions integration entry point.
 *
 * To deploy as Firebase Cloud Function:
 * If using firebase-functions package:
 *   import { onRequest } from 'firebase-functions/v2/https';
 *   import app from './app.js';
 *   export const api = onRequest({ cors: true, maxInstances: 10 }, app);
 *
 * For now, this exports a function handler compatible with Cloud Run and GCP HTTP functions.
 */

import app from './app.js';

export const apiHandler = (req, res) => {
  return app(req, res);
};

export default apiHandler;
