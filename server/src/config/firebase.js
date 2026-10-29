import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import config from './index.js';
import logger from '../utils/logger.js';

let app = null;
let auth = null;
let db = null;
let storage = null;
let isInitialized = false;

try {
  // 1. Check if already initialized
  if (admin.apps.length > 0) {
    app = admin.apps[0];
    isInitialized = true;
  } else {
    let credential = null;

    // 2. Check for serviceAccountKey.json path
    if (config.firebase.serviceAccountPath) {
      const fullPath = path.resolve(process.cwd(), config.firebase.serviceAccountPath);
      if (fs.existsSync(fullPath)) {
        const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        credential = admin.credential.cert(fileContent);
        logger.info('Firebase Admin initialized with service account key file.');
      }
    }

    // 3. Check for individual environment variables
    if (!credential && config.firebase.clientEmail && config.firebase.privateKey) {
      credential = admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey
      });
      logger.info('Firebase Admin initialized with environment variable credentials.');
    }

    // 4. Default application credentials (used in Google Cloud / Firebase Cloud Functions)
    if (!credential && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
      logger.info('Firebase Admin initialized with Google Application Default Credentials.');
    }

    if (credential) {
      app = admin.initializeApp({
        credential,
        projectId: config.firebase.projectId,
        storageBucket: config.firebase.storageBucket || `${config.firebase.projectId}.appspot.com`
      });
      isInitialized = true;
      logger.info(`Firebase Admin SDK connected successfully to project [${config.firebase.projectId}].`);
    } else {
      // Graceful fallback for local scaffolding before live keys are added
      logger.warn(
        'Firebase Admin credentials not found. Running in unauthenticated demo mode. Add serviceAccountKey.json or set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in server/.env.'
      );
    }
  }

  if (isInitialized && app) {
    auth = admin.auth(app);
    db = admin.firestore(app);
    storage = admin.storage(app);
  }
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK:', error.message);
}

export { admin, app, auth, db, storage, isInitialized };
export default { admin, app, auth, db, storage, isInitialized };
