import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with long polling to fix connectivity issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Enable multi-tab offline database persistence with comprehensive sandboxing safeguards
try {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log("[Firebase] Multi-tab offline persistence enabled successfully!");
    })
    .catch((err) => {
      console.warn("[Firebase] Offline persistence failed to activate (expected in some sandboxed frames):", err.message);
    });
} catch (err: any) {
  console.warn("[Firebase] Offline persistence setup encountered an execution system block:", err?.message || String(err));
}

export const auth = getAuth(app);

// Validate connection to Firestore with a slight delay to allow network layer initialization
async function testConnection() {
  try {
    console.log("[Firebase] Testing connection to database:", firebaseConfig.firestoreDatabaseId);
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[Firebase] Connection successful!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
      console.error("Project ID:", firebaseConfig.projectId);
      console.error("Database ID:", firebaseConfig.firestoreDatabaseId);
    } else {
      console.log("[Firebase] Test connection note:", error instanceof Error ? error.message : String(error));
    }
  }
}
setTimeout(testConnection, 3000);
