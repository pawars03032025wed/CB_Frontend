// Centralized Firestore error handling utility
import { auth } from "../firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function safeStringify(obj: any): string {
  // Use a WeakSet to handle circular references efficiently
  const cache = new WeakSet();

  const sanitize = (val: any): any => {
    // 1. Basic types and null
    if (val === null || typeof val !== 'object') {
      if (typeof val === 'function') return '[Function]';
      return val;
    }

    // 2. Circularity check
    try {
      if (cache.has(val)) return '[Circular]';
    } catch (e) {
      // Some objects (like cross-origin objects) might throw on WeakSet.has
      return '[Un-cacheable Object]';
    }

    // 3. Known globals (Window, Document)
    if (typeof window !== 'undefined' && val === window) return '[Window]';
    if (typeof document !== 'undefined' && val === document) return '[Document]';

    // 4. Aggressively identify and prune native DOM nodes and complex objects
    try {
      const constructorName = val.constructor?.name || '';
      const stringTag = Object.prototype.toString.call(val);
      
      // Check for DOM elements, React internals, Events, etc.
      const isNative = 
        val.nodeType !== undefined || 
        stringTag.includes('HTML') ||
        stringTag.includes('Element') ||
        stringTag.includes('Event') ||
        stringTag.includes('Fiber') ||
        stringTag === '[object Window]' ||
        constructorName.includes('HTML') || 
        constructorName.includes('Element') || 
        constructorName.includes('Fiber') || 
        constructorName.includes('Event') ||
        constructorName === 'Window' ||
        constructorName === 'NodeList' ||
        constructorName === 'HTMLCollection' ||
        // Audio elements and events often have these
        (typeof val.play === 'function' && typeof val.pause === 'function') ||
        (typeof val.preventDefault === 'function' && typeof val.stopPropagation === 'function');

      if (isNative) {
        // Try to extract some useful info from common native objects
        const info: any = { _type: `Native:${constructorName || stringTag}` };
        
        if (stringTag.includes('Event') || constructorName.includes('Event')) {
          info.type = val.type;
          info.cancelable = val.cancelable;
          // Look for native error if it's a media event or react event
          const nativeTarget = val.nativeEvent?.target || val.target;
          if (nativeTarget) {
            info.target = `[${nativeTarget.constructor?.name || 'Target'}]`;
            if (nativeTarget.error) {
              info.targetError = {
                code: nativeTarget.error.code,
                message: nativeTarget.error.message
              };
            }
          }
        }
        
        if (val instanceof HTMLElement || stringTag.includes('Element')) {
          info.tagName = val.tagName;
          info.id = val.id;
          if (val.error) {
            info.error = {
              code: val.error.code,
              message: val.error.message
            };
          }
        }

        return info;
      }

      // Special handling for Errors - they often have empty Object.keys()
      if (val instanceof Error || stringTag === '[object Error]') {
        const errObj: any = {
          name: val.name,
          message: val.message,
          stack: val.stack
        };
        // Also try to get custom properties
        try {
          Object.keys(val).forEach(key => {
            errObj[key] = sanitize(val[key]);
          });
        } catch (e) { /* ignore */ }
        return errObj;
      }

      // Check for hidden React keys that might show up during stringification
      const propNames = Object.getOwnPropertyNames(val);
      if (propNames.some(k => k.startsWith('__react') || k.startsWith('_react'))) {
        return `[ReactInternal:${constructorName}]`;
      }
    } catch (e) {
      // If we can't inspect it, it's likely a proxied or native object
      return '[Uninspectable Object]';
    }

    // 5. Add to cache to prevent recursion on this exact object
    try {
      cache.add(val);
    } catch (e) {
      // Ignore if can't add to WeakSet
    }

    // 6. Handle Arrays
    if (Array.isArray(val)) {
      return val.map(item => sanitize(item));
    }

    // 6.1 Handle Sets
    if (val instanceof Set) {
      return Array.from(val).map(item => sanitize(item));
    }

    // 6.2 Handle Maps
    if (val instanceof Map) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([k, v]) => [String(k), sanitize(v)])
      );
    }

    // 7. Handle Regular Objects - construct a new sanitized version
    const sanitizedObj: any = {};
    
    // Use getOwnPropertyNames to catch non-enumerable properties that might be interesting
    // but filter them to avoid infinite loops and massive overhead
    try {
      const keys = Object.keys(val);
      
      for (const key of keys) {
        try {
          // Skip common React internal keys explicitly at the property level
          if (
            key.startsWith('__react') || 
            key.startsWith('_react') || 
            ['stateNode', 'return', 'alternate', '_owner', 'memoizedProps', 'memoizedState'].includes(key)
          ) {
            sanitizedObj[key] = '[Pruned]';
            continue;
          }

          // Recursively sanitize each property
          sanitizedObj[key] = sanitize(val[key]);
        } catch (err) {
          sanitizedObj[key] = '[Error Accessing Property]';
        }
      }
    } catch (err) {
      return `[Error Sanitizing Object: ${val.constructor?.name || 'Unknown'}]`;
    }
    
    return sanitizedObj;
  };

  try {
    const cleanObject = sanitize(obj);
    return JSON.stringify(cleanObject);
  } catch (err) {
    // Ultimate fallback if even the sanitized version fails stringification
    try {
      if (obj && typeof obj === 'object') {
        const typeStr = obj.constructor?.name || Object.prototype.toString.call(obj);
        return `{"error": "serialization_failed", "type": "${typeStr}"}`;
      }
      return JSON.stringify(String(obj));
    } catch {
      return '{"error": "total_serialization_failure"}';
    }
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  let errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error?.code || 'unknown';

  if (errorCode === 'permission-denied') {
    errorMessage = "Permission Denied: Access restricted.";
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  console.error(`Firestore Error [${operationType}] at [${path}]:`, { errorMessage, errorCode });
  
  if (errorMessage.toLowerCase().includes("offline") || errorMessage.toLowerCase().includes("could not reach")) {
    return;
  }

  throw new Error(safeStringify(errInfo));
}
