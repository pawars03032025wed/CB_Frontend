import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentData,
  limit
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { User, HospitalDetail, ClinicDetail, Referral, Message, Doctor } from '../types';
import { handleFirestoreError, OperationType, safeStringify } from '../utils/firestoreErrorHandler';

// Telemetry monitor for Firebase optimization profiling
export const telemetry = {
  reads: 0,
  writes: 0,
  slowQueries: [] as { query: string; duration: number; timestamp: string }[],
  
  trackRead(collectionName: string, count: number) {
    this.reads += count;
    console.log(`[Telemetry] Read ${count} documents from '${collectionName}'. Cumulative reads: ${this.reads}`);
  },
  
  trackWrite(collectionName: string) {
    this.writes += 1;
    console.log(`[Telemetry] Write operation on '${collectionName}'. Cumulative writes: ${this.writes}`);
  },
  
  trackQueryDuration(queryString: string, duration: number) {
    if (duration > 500) {
      const logEntry = { query: queryString, duration, timestamp: new Date().toISOString() };
      this.slowQueries.push(logEntry);
      console.warn(`[Telemetry] SLOW QUERY DETECTED: "${queryString}" took ${duration}ms`);
    }
  }
};

if (typeof window !== "undefined") {
  (window as any).__firebaseTelemetry = telemetry;
}

// Intelligent LocalStorage persistent cache manager
const persistentCache = {
  get(key: string) {
    try {
      const dataStr = localStorage.getItem(`cb_cache:${key}`);
      if (!dataStr) return null;
      const parsed = JSON.parse(dataStr);
      if (parsed.expiry > Date.now()) {
        return parsed.data;
      }
      localStorage.removeItem(`cb_cache:${key}`);
    } catch (e) {
      // ignore silently
    }
    return null;
  },
  set(key: string, data: any[], ttlMs: number) {
    try {
      localStorage.setItem(`cb_cache:${key}`, JSON.stringify({
        data,
        expiry: Date.now() + ttlMs
      }));
    } catch (e) {
      // ignore silently
    }
  },
  invalidate(collectionName: string) {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`cb_cache:${collectionName}:`)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // ignore silently
    }
  }
};

// Shared subscription cache to prevent duplicate listeners and keep read consumption minimum
const activeSharedListeners = new Map<string, {
  unsubscribe: () => void;
  subscribers: Set<(data: any[]) => void>;
  lastData: any[] | null;
  registryId: string;
}>();

// Read query cache for getCollection
const queryCache = new Map<string, { data: any[]; expiry: number }>();
const CACHE_TTL_MS = 10000; // 10 seconds memory cache for high-frequency gets
const STATIC_CACHE_TTL_MS = 300000; // 5 minutes cache for static directories

export const firebaseService = {
  async trackLoginActivity(userId: string, usernameOrEmail: string, status: 'success' | 'failed', role: string) {
    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
      let deviceType = "Desktop";
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        deviceType = "Mobile";
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = "Tablet";
      }
      
      let os = "Unknown";
      if (userAgent.indexOf("Win") !== -1) os = "Windows";
      else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
      else if (userAgent.indexOf("X11") !== -1) os = "UNIX";
      else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
      else if (/Android/i.test(userAgent)) os = "Android";
      else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";

      const browser = userAgent.split(" ").slice(-2).join(" ") || "Browser";

      const activityData = {
        userId,
        username: usernameOrEmail,
        status,
        role,
        timestamp: serverTimestamp(),
        deviceInfo: `${deviceType} (${os}) via ${browser}`,
        userAgent,
      };

      await addDoc(collection(db, 'login_activity'), activityData);
      console.log(`[FirebaseService] Logged login activity for user ${userId} (${status})`);
    } catch (e) {
      console.error("[FirebaseService] Error logging login activity:", e);
    }
  },

  // Auth simulation (using Firestore since we want to keep username/password for now)
  async login(username: string, password: string) {
    try {
      const normalizedUsername = username.trim().toUpperCase();
      console.log("[Firebase] Attempting login for:", normalizedUsername);
      
      const q = query(
        collection(db, 'users'), 
        where('username', '==', normalizedUsername), 
        where('password', '==', password)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // Log failed attempt
        await this.trackLoginActivity("UNKNOWN", normalizedUsername, "failed", "unknown");
        return { success: false, message: "Invalid username or password. (Check if you clicked 'Seed System Data')" };
      }
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      
      // Log successful login
      await this.trackLoginActivity(userDoc.id, normalizedUsername, "success", userData.role || "unknown");
      
      return { success: true, user: userData };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
  },

  async loginWithEmail(email: string, pass: string) {
    try {
      console.log("[Firebase] Attempting Email Auth for:", email);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = credential.user;
      
      // Check if user exists by query
      const q = query(collection(db, 'users'), where('email', '==', email.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        // Create user doc if auth exists but firestore user record does not
        const newUserData = {
          username: email.toLowerCase(),
          email: email.trim(),
          authProvider: 'email',
          firebaseUid: fbUser.uid,
          emailVerified: fbUser.emailVerified,
          role: 'patient',
          status: 'active',
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', fbUser.uid), newUserData);
        await addDoc(collection(db, 'patient_details'), {
          userId: fbUser.uid,
          age: 0,
          contact_no: '',
          address: '',
          createdAt: serverTimestamp()
        });
        await this.trackLoginActivity(fbUser.uid, email, "success", "patient");
        return { success: true, user: { id: fbUser.uid, ...newUserData } };
      }
      
      const userDoc = snap.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() } as any;
      
      // sync email verification to Firestore
      if (fbUser.emailVerified && !userData.emailVerified) {
        await setDoc(doc(db, 'users', userDoc.id), { emailVerified: true }, { merge: true });
        userData.emailVerified = true;
      }
      
      await this.trackLoginActivity(userDoc.id, email, "success", userData.role || "unknown");
      return { success: true, user: userData };
    } catch (error: any) {
      console.error("[Firebase] Email Auth login error:", error);
      await this.trackLoginActivity("UNKNOWN", email, "failed", "email");
      return { success: false, message: error?.message || "Invalid email or password." };
    }
  },

  async registerUserWithEmail(userData: any) {
    try {
      const { email, password, role, name, city, details } = userData;
      const normalizedEmail = email.trim();
      
      // Verify user collection check
      const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, message: "Email already registered in system." };
      }

      // Create Firebase Auth user First
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = credential.user;
      
      // Send verification email
      await sendEmailVerification(fbUser);
      
      const userDocData = {
        username: normalizedEmail.toLowerCase(),
        email: normalizedEmail,
        authProvider: 'email',
        firebaseUid: fbUser.uid,
        emailVerified: false,
        role,
        name,
        city,
        status: role === 'patient' ? 'active' : 'pending',
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', fbUser.uid), userDocData);
      
      // Add details
      if (role === 'hospital') {
        await setDoc(doc(db, 'hospital_details', fbUser.uid), {
          userId: fbUser.uid,
          tier: 'standard',
          schemes: '',
          departments: '',
          helpline: details?.helpline || '',
          address: details?.address || '',
          email: details?.email || normalizedEmail,
          createdAt: serverTimestamp()
        });
      } else if (role === 'clinic') {
        await setDoc(doc(db, 'clinic_details', fbUser.uid), {
          userId: fbUser.uid,
          doctor_name: details?.doctor_name || name,
          qualification: details?.qualification || '',
          reg_no: details?.reg_no || '',
          contact_no: details?.contact_no || '',
          address: details?.address || '',
          email: details?.email || normalizedEmail,
          rating: 5,
          tier: 'standard',
          degree: details?.degree || '',
          createdAt: serverTimestamp()
        });
      } else if (role === 'patient') {
        await setDoc(doc(db, 'patient_details', fbUser.uid), {
          userId: fbUser.uid,
          age: details?.age || 0,
          contact_no: details?.contact_no || '',
          address: details?.address || '',
          createdAt: serverTimestamp()
        });
      }
      
      await this.trackLoginActivity(fbUser.uid, normalizedEmail, "success", role);
      
      // Fire-and-forget the welcome email via backend
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, accountType: role, name: name || 'User' })
      }).catch(err => console.error("Failed to trigger welcome email", err));
      
      return { 
        success: true, 
        message: "Registration successful! A verification email has been sent to your inbox.",
        user: { id: fbUser.uid, ...userDocData }
      };
    } catch (error: any) {
      console.error("[Firebase] registerUserWithEmail error:", error);
      return { success: false, message: error?.message || "Registration failed." };
    }
  },

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in our 'users' collection
      let userSnap = await getDoc(doc(db, 'users', user.uid));
      let userDocId = user.uid;
      let userData: any = null;
      
      if (userSnap.exists()) {
        userData = { id: userSnap.id, ...userSnap.data() };
      } else {
        // Query by email
        const qByEmail = query(collection(db, 'users'), where('email', '==', user.email));
        const emailSnap = await getDocs(qByEmail);
        
        if (!emailSnap.empty) {
          const matchedDoc = emailSnap.docs[0];
          userDocId = matchedDoc.id;
          userData = { id: userDocId, ...matchedDoc.data() };
          
          // Link Google identifier securely without altering primary record ID references!
          await setDoc(doc(db, 'users', userDocId), { 
            firebaseUid: user.uid, 
            authProvider: 'google', 
            emailVerified: true 
          }, { merge: true });
          
          userData.firebaseUid = user.uid;
          userData.authProvider = 'google';
          userData.emailVerified = true;
        }
      }
      
      if (userData) {
        await this.trackLoginActivity(userDocId, user.email || "Google User", "success", userData.role || "patient");
        return { success: true, user: userData as User };
      } else {
        // Create new patient user
        const newUserData = {
          username: (user.email || user.uid).toLowerCase(),
          name: user.displayName || "Patient",
          email: user.email,
          photoURL: user.photoURL,
          role: 'patient',
          status: 'active',
          authProvider: 'google',
          firebaseUid: user.uid,
          emailVerified: true,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', user.uid), newUserData);
        
        await addDoc(collection(db, 'patient_details'), {
          userId: user.uid,
          age: 0,
          contact_no: '',
          address: '',
          createdAt: serverTimestamp()
        });
        
        await this.trackLoginActivity(user.uid, user.email || "Google User", "success", "patient");
        
        // Fire-and-forget the welcome email via backend
        if (user.email) {
          fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, accountType: 'patient', name: user.displayName || 'Patient' })
          }).catch(err => console.error("Failed to trigger welcome email", err));
        }

        return { success: true, user: { id: user.uid, ...newUserData } as User };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/google');
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'auth/logout');
    }
  },

  async upgradeAccountToGoogle(currUserId: string, email: string) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      // Update existing Firestore user record with Google Auth ID details
      await setDoc(doc(db, 'users', currUserId), {
        firebaseUid: googleUser.uid,
        authProvider: 'google',
        email: googleUser.email,
        emailVerified: true
      }, { merge: true });
      
      return { success: true, message: "Account upgraded with Google Sign-in successfully!" };
    } catch (error: any) {
      console.error("[Firebase] Account upgrade to Google failed:", error);
      return { success: false, message: error?.message || "Failed to upgrade account with Google Auth." };
    }
  },

  async upgradeAccountToEmail(currUserId: string, email: string, pass: string) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = credential.user;
      
      // Send verification email
      await sendEmailVerification(fbUser);
      
      // Update existing Firestore user record with email password details
      await setDoc(doc(db, 'users', currUserId), {
        email: email.trim(),
        firebaseUid: fbUser.uid,
        authProvider: 'email',
        emailVerified: false
      }, { merge: true });
      
      return { success: true, message: "Account security upgraded! A verification email has been sent." };
    } catch (error: any) {
      console.error("[Firebase] Account upgrade to Email failed:", error);
      return { success: false, message: error?.message || "Failed to upgrade account with secure email identifier." };
    }
  },

  async resendVerificationEmail() {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true, message: "Verification email resent successfully!" };
      }
      return { success: false, message: "No active authenticated session." };
    } catch (error: any) {
      console.error("[Firebase] resendVerificationEmail error:", error);
      return { success: false, message: error?.message || "Failed to resend verification email." };
    }
  },

  async register(userData: any) {
    try {
      const { username, password, role, name, city, details } = userData;
      const normalizedUsername = username.trim().toUpperCase();
      
      // Check if user exists
      const q = query(collection(db, 'users'), where('username', '==', normalizedUsername));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, message: "Username already exists" };
      }

      // Create user
      const userRef = await addDoc(collection(db, 'users'), {
        username: normalizedUsername,
        password,
        role,
        name,
        city,
        status: role === 'patient' ? 'active' : 'pending',
        createdAt: serverTimestamp()
      });

      const userId = userRef.id;

      // Add details
      if (role === 'hospital') {
        await addDoc(collection(db, 'hospital_details'), {
          userId,
          tier: 'standard',
          schemes: '',
          departments: '',
          helpline: details.helpline || '',
          address: details.address || '',
          email: details.email || ''
        });
      } else if (role === 'clinic') {
        await addDoc(collection(db, 'clinic_details'), {
          userId,
          doctor_name: details.doctor_name || name,
          qualification: details.qualification || '',
          reg_no: details.reg_no || '',
          contact_no: details.contact_no || '',
          address: details.address || '',
          email: details.email || '',
          rating: 5,
          tier: 'standard',
          degree: details.degree || ''
        });
      } else if (role === 'patient') {
        await addDoc(collection(db, 'patient_details'), {
          userId,
          age: details.age || 0,
          contact_no: details.contact_no || '',
          address: details.address || ''
        });
      }

      return { 
        success: true, 
        message: role === 'patient' ? "Registration successful!" : "Registration successful. Waiting for admin approval.",
        user: role === 'patient' ? { id: userId, username: normalizedUsername, role, name, city, status: 'active' } : null
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/details');
    }
  },

  // Active listener monitoring registry (retained for diagnostics and window references)
  activeListenersRegistry: {
    listeners: new Map<string, { id: string; path: string; queryDetails?: string; createdAt: string }>(),
    add(id: string, path: string, queryDetails?: string) {
      this.listeners.set(id, {
        id,
        path,
        queryDetails,
        createdAt: new Date().toISOString()
      });
      console.log(`[REALTIME-MONITOR] Added listener [${id}] on [${path}]. Query: ${queryDetails || 'none'}. Active count: ${this.listeners.size}`);
    },
    remove(id: string) {
      if (this.listeners.delete(id)) {
        console.log(`[REALTIME-MONITOR] Removed listener [${id}]. Remaining active: ${this.listeners.size}`);
      }
    },
    getActiveCount() {
      return this.listeners.size;
    },
    getListeners() {
      return Array.from(this.listeners.values());
    }
  },

  // Deduplicated high-performance query/collection subscription
  subscribeToCollection(
    collectionName: string, 
    callback: (data: any[]) => void, 
    filters?: { field: string, operator: any, value: any }[]
  ) {
    const isRealTime = [
      'opd_queue', 'notifications', 'referrals', 'messages',
      'billings', 'credit_records', 'credit_accounts',
      'daily_finance', 'transactions',
      'credit_payment_history', 'patient_payment_history',
      'medical_reports', 'medicine_reminders', 'appointments',
      'health_logs', 'medicine_logs', 'habit_logs',
      'patient_details', 'emergency_contacts'
    ].includes(collectionName);
    
    // Generate a standardized key representation of the collection name + filters
    const sortedFilters = filters 
      ? [...filters].sort((a, b) => a.field.localeCompare(b.field))
      : [];
    const filterKey = JSON.stringify(sortedFilters.map(f => ({ f: f.field, o: f.operator, q: String(f.value) })));
    const cacheKey = `${collectionName}:${filterKey}`;

    if (activeSharedListeners.has(cacheKey)) {
      const liveListener = activeSharedListeners.get(cacheKey)!;
      liveListener.subscribers.add(callback);
      
      // If we already have the list pre-fetched in memory, serve it to the callback immediately to make load time instantaneous
      if (liveListener.lastData) {
        callback([...liveListener.lastData]);
      }
      
      return () => {
        liveListener.subscribers.delete(callback);
        if (liveListener.subscribers.size === 0) {
          liveListener.unsubscribe();
          activeSharedListeners.delete(cacheKey);
          firebaseService.activeListenersRegistry.remove(liveListener.registryId);
        }
      };
    }

    const listenerId = `${collectionName}_${Math.random().toString(36).substring(2, 11)}`;
    const queryDetails = filters ? JSON.stringify(filters) : undefined;
    
    firebaseService.activeListenersRegistry.add(listenerId, collectionName, queryDetails);

    const subscribersSet = new Set<(data: any[]) => void>();
    subscribersSet.add(callback);

    const sharedEntry = {
      unsubscribe: () => {},
      subscribers: subscribersSet,
      lastData: null as any[] | null,
      registryId: listenerId
    };

    activeSharedListeners.set(cacheKey, sharedEntry);

    if (isRealTime) {
      let q = query(collection(db, collectionName));
      if (filters) {
        filters.forEach(f => {
          q = query(q, where(f.field, f.operator, f.value));
        });
      }

      // Default limits to prevent reading massive histories
      const defaultLimits: Record<string, number> = {
        'messages': 100,
        'referrals': 150,
        'notifications': 100,
        'opd_queue': 150,
        'billings': 200,
        'credit_records': 200,
        'credit_accounts': 200,
        'daily_finance': 100,
        'transactions': 200,
        'credit_payment_history': 200,
        'patient_payment_history': 200
      };
      const limitSize = defaultLimits[collectionName];
      if (limitSize) {
        q = query(q, limit(limitSize));
      }

      const unsubscribeLive = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sharedEntry.lastData = data;
        
        // Track telemetry
        telemetry.trackRead(collectionName, data.length || 1);
        
        // Clear memory cache of this collection to remain consistent with new snapshot updates
        firebaseService.invalidateCache(collectionName);
        persistentCache.invalidate(collectionName);

        // Invoke all shared subscriber callbacks safely
        sharedEntry.subscribers.forEach(cb => {
          try {
            cb([...data]);
          } catch (err) {
            console.error(`[Firebase] Shared callback invocation error for ${collectionName}:`, err);
          }
        });
      }, (error) => {
        console.warn(`[Firebase] shared onSnapshot listener warning for ${collectionName}:`, safeStringify(error));
      });

      sharedEntry.unsubscribe = unsubscribeLive;
    } else {
      // For non-realtime, load cached/fetch once and notify subscribers in-memory
      firebaseService.getCollection(collectionName, filters).then(data => {
        if (data) {
          sharedEntry.lastData = data;
          sharedEntry.subscribers.forEach(cb => {
            try {
              cb([...data]);
            } catch (err) {
              console.error(`[Firebase] Shared callback error for non-realtime ${collectionName}:`, err);
            }
          });
        }
      });

      sharedEntry.unsubscribe = () => {};
    }

    return () => {
      const liveListener = activeSharedListeners.get(cacheKey);
      if (liveListener) {
        liveListener.subscribers.delete(callback);
        if (liveListener.subscribers.size === 0) {
          liveListener.unsubscribe();
          activeSharedListeners.delete(cacheKey);
          firebaseService.activeListenersRegistry.remove(liveListener.registryId);
        }
      }
    };
  },

  notifySubscribers(collectionName: string) {
    try {
      console.log(`[In-Memory Sync] Notifying active subscribers of '${collectionName}' local updates...`);
      for (const [cacheKey, sharedEntry] of activeSharedListeners.entries()) {
        if (cacheKey.startsWith(`${collectionName}:`)) {
          const filterStr = cacheKey.substring(collectionName.length + 1);
          let filters: any[] | undefined = undefined;
          try {
            const parsed = JSON.parse(filterStr);
            filters = parsed.map((item: any) => ({
              field: item.f,
              operator: item.o,
              value: item.q === 'true' ? true : (item.q === 'false' ? false : (isNaN(Number(item.q)) ? item.q : Number(item.q)))
            }));
          } catch (e) {
            // ignore silently
          }

          // Clear live cache so getCollection fetches fresh data from Firestore
          sharedEntry.lastData = null;
          
          this.getCollection(collectionName, filters).then(data => {
            if (data) {
              sharedEntry.lastData = data;
              sharedEntry.subscribers.forEach(cb => {
                try {
                  cb([...data]);
                } catch (cbErr) {
                  // ignore silently
                }
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("[In-Memory Sync] Error triggering notifications:", err);
    }
  },

  invalidateCache(collectionName: string) {
    for (const key of queryCache.keys()) {
      if (key.startsWith(`${collectionName}:`)) {
        queryCache.delete(key);
      }
    }
    persistentCache.invalidate(collectionName);
  },

  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      
      // Diffing Write Optimization to prevent duplicate uploads of unchanged logos/banners
      let existingDoc = queryCache.get(`${collectionName}:id==${docId}`)?.data?.[0];
      if (!existingDoc) {
        try {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            existingDoc = snap.data();
          }
        } catch (e) {
          // ignore silently
        }
      }

      let dataToUpdate = { ...data };
      if (existingDoc) {
        const keys = Object.keys(dataToUpdate);
        const cleanedData: any = {};
        let hasChanges = false;
        
        for (const key of keys) {
          const newVal = dataToUpdate[key];
          const oldVal = existingDoc[key];
          
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            cleanedData[key] = newVal;
            hasChanges = true;
          }
        }
        
        if (!hasChanges) {
          console.log(`[FirebaseService] updateDocument skipped for ${collectionName}/${docId} - no changes detected.`);
          return;
        }
        dataToUpdate = cleanedData;
      }

      await setDoc(docRef, { ...dataToUpdate, updatedAt: serverTimestamp() }, { merge: true });
      
      // Invalidate caches
      this.invalidateCache(collectionName);
      persistentCache.invalidate(collectionName);
      
      // Track write telemetry
      telemetry.trackWrite(collectionName);
      
      // Notify active memory subscribers
      this.notifySubscribers(collectionName);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    }
  },

  async deleteDocument(collectionName: string, docId: string) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      
      // Invalidate caches
      this.invalidateCache(collectionName);
      persistentCache.invalidate(collectionName);
      
      // Track write telemetry
      telemetry.trackWrite(collectionName);
      
      // Notify active memory subscribers
      this.notifySubscribers(collectionName);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  },

  async addDocument(collectionName: string, data: any) {
    try {
      let docData = { ...data };
      if (collectionName === 'messages') {
        const senderId = data.senderId || data.userId;
        const receiverId = data.receiverId || data.recipient_id || data.recipientId;
        if (senderId && receiverId && !docData.participants) {
          docData.participants = [String(senderId), String(receiverId)];
        }
      }
      
      const docRef = await addDoc(collection(db, collectionName), { ...docData, createdAt: serverTimestamp() });
      
      // Invalidate caches
      this.invalidateCache(collectionName);
      persistentCache.invalidate(collectionName);
      
      // Track write telemetry
      telemetry.trackWrite(collectionName);
      
      // Notify active memory subscribers
      this.notifySubscribers(collectionName);
      
      return docRef;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
      throw error;
    }
  },

  async getCollection(collectionName: string, filters?: { field: string, operator: any, value: any }[]) {
    try {
      const sortedFilters = filters 
        ? [...filters].sort((a, b) => a.field.localeCompare(b.field))
        : [];
      const filterKey = JSON.stringify(sortedFilters.map(f => ({ f: f.field, o: f.operator, q: String(f.value) })));
      const cacheKey = `${collectionName}:${filterKey}`;

      // 1. If an active subscription exists for this identical query, use its live cache
      if (activeSharedListeners.has(cacheKey)) {
        const liveData = activeSharedListeners.get(cacheKey)!.lastData;
        if (liveData) {
          return [...liveData];
        }
      }

      // 2. Fallback to memory queryCache
      const cached = queryCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return [...cached.data];
      }

      // 3. Fallback to persistent local storage cache
      const stored = persistentCache.get(cacheKey);
      if (stored) {
        queryCache.set(cacheKey, {
          data: stored,
          expiry: Date.now() + CACHE_TTL_MS
        });
        return [...stored];
      }

      let q = query(collection(db, collectionName));
      if (filters) {
        filters.forEach(f => {
          q = query(q, where(f.field, f.operator, f.value));
        });
      }

      // Default limits to prevent reading massive histories
      const defaultLimits: Record<string, number> = {
        'login_activity': 50,
        'messages': 100,
        'referrals': 150,
        'billings': 100,
        'transactions': 100,
        'patient_payment_history': 100,
        'medicine_logs': 100,
        'health_logs': 100,
        'medical_reports': 50,
        'daily_finance': 100
      };

      const limitSize = defaultLimits[collectionName];
      if (limitSize) {
        q = query(q, limit(limitSize));
      }

      const startTime = Date.now();
      const snap = await getDocs(q);
      const duration = Date.now() - startTime;
      
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Track telemetry
      telemetry.trackRead(collectionName, docs.length || 1);
      telemetry.trackQueryDuration(`${collectionName}: ${filterKey}`, duration);

      const isStatic = ['users', 'hospital_details', 'clinic_details'].includes(collectionName);
      const ttl = isStatic ? STATIC_CACHE_TTL_MS : CACHE_TTL_MS;

      // Update caches
      queryCache.set(cacheKey, {
        data: docs,
        expiry: Date.now() + ttl
      });
      persistentCache.set(cacheKey, docs, ttl);

      return docs;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
      return [];
    }
  },

  async seedData() {
    try {
      console.log("[Firebase] Starting seed process...");
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', 'PLUSADMIN'));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        console.log("[Firebase] Data already exists, skipping seed.");
        return { success: true, message: "Data already seeded" };
      }

      // Seed Admin
      console.log("[Firebase] Seeding Admin...");
      const adminRef = await addDoc(usersRef, {
        username: "PLUSADMIN",
        password: "plus@098",
        role: "admin",
        name: "Master Admin",
        city: "System",
        status: "active",
        createdAt: serverTimestamp()
      });

      // Seed Hospital
      console.log("[Firebase] Seeding Hospital...");
      const hospRef = await addDoc(usersRef, {
        username: "PLUSHOSPITAL",
        password: "plus@098",
        role: "hospital",
        name: "CareBridge+ Hospital",
        city: "Aurangabad",
        status: "active",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'hospital_details'), {
        userId: hospRef.id,
        tier: "premium",
        schemes: "MJPJAY, PMJAY, Cashless",
        departments: "Orthopedics, Cardiology, Gynecology, Neurology",
        helpline: "0240-1234567",
        address: "Main Road, CareBridge+ Hospital",
        email: "hosp@carebridge.com",
        createdAt: serverTimestamp()
      });

      // Seed Clinic
      console.log("[Firebase] Seeding Clinic...");
      const clinicRef = await addDoc(usersRef, {
        username: "PLUSCLINIC",
        password: "plus@098",
        role: "clinic",
        name: "Patil Clinic",
        city: "Aurangabad",
        status: "active",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'clinic_details'), {
        userId: clinicRef.id,
        doctor_name: "Dr. Patil",
        qualification: "MBBS, MD",
        reg_no: "MMC-12345",
        contact_no: "9988776655",
        address: "Clinic Street, Patil Clinic",
        email: "clinic@carebridge.com",
        rating: 5,
        tier: "standard",
        degree: "MBBS, MD",
        createdAt: serverTimestamp()
      });

      console.log("[Firebase] Seed complete!");
      return { success: true, message: "Initial data seeded successfully!" };
    } catch (error) {
      console.error("[Firebase] Seed error:", safeStringify(error));
      handleFirestoreError(error, OperationType.WRITE, 'seed');
    }
  }
};

if (typeof window !== "undefined") {
  (window as any).__firebaseListenersRegistry = firebaseService.activeListenersRegistry;
}
