// Hybrid Offline Storage - Multiple layers for reliability
// localStorage (fast) + IndexedDB (large) + Firebase (cloud sync)

var storageLayers = {
  localStorage: true,    // Fast, small data
  indexedDB: true,        // Large data
  firebase: true         // Cloud sync
};

// Enhanced save function with multiple storage layers
async function saveToAllLayers(dataType, data) {
  var promises = [];
  
  // Layer 1: localStorage (fast access)
  if (storageLayers.localStorage) {
    try {
      localStorage.setItem('ipl2026_' + dataType, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage full, using other layers');
    }
  }
  
  // Layer 2: IndexedDB (large storage)
  if (storageLayers.indexedDB && db) {
    promises.push(saveToIndexedDB(dataType, data));
  }
  
  // Layer 3: Firebase (cloud sync - only if online)
  if (storageLayers.firebase && navigator.onLine && state.currentUser) {
    promises.push(saveToFirebase(dataType, data));
  }
  
  return Promise.allSettled(promises);
}

// Load from storage layers in priority order
async function loadFromLayers(dataType) {
  // Try localStorage first (fastest)
  try {
    var localData = localStorage.getItem('ipl2026_' + dataType);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (e) {
    console.warn('localStorage read failed');
  }
  
  // Try IndexedDB
  if (storageLayers.indexedDB && db) {
    try {
      var indexedData = await getAllFromIndexedDB(dataType);
      if (indexedData && indexedData.length > 0) {
        return indexedData;
      }
    } catch (e) {
      console.warn('IndexedDB read failed');
    }
  }
  
  // Try Firebase (if online)
  if (storageLayers.firebase && navigator.onLine && state.currentUser) {
    try {
      var firebaseData = await loadFromFirebase(dataType);
      if (firebaseData) {
        return firebaseData;
      }
    } catch (e) {
      console.warn('Firebase read failed');
    }
  }
  
  return null;
}

// Storage space management
async function manageStorageSpace() {
  var quota = await checkQuota();
  var usagePercent = (quota.usage / quota.quota) * 100;
  
  console.log('Storage usage:', usagePercent.toFixed(2) + '%');
  
  if (usagePercent > 80) {
    console.warn('Storage nearly full, cleaning old data');
    await cleanupOldData();
  }
}

// Clean up old data
async function cleanupOldData() {
  // Remove old entries older than 30 days
  var thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  
  if (db) {
    var transaction = db.transaction(['entries'], 'readwrite');
    var store = transaction.objectStore('entries');
    var request = store.openCursor();
    
    request.onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        if (new Date(cursor.value.date) < thirtyDaysAgo) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

// Offline data sync queue
var syncQueue = [];

function queueForSync(data) {
  syncQueue.push({
    data: data,
    timestamp: Date.now(),
    synced: false
  });
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}

async function processSyncQueue() {
  if (!navigator.onLine || syncQueue.length === 0) return;
  
  for (var item of syncQueue) {
    if (!item.synced) {
      try {
        await saveToFirebase(item.data);
        item.synced = true;
      } catch (error) {
        console.error('Sync failed:', error);
        break; // Stop on first error
      }
    }
  }
  
  // Remove synced items
  syncQueue = syncQueue.filter(item => !item.synced);
}

// Network status listener
function setupNetworkListeners() {
  window.addEventListener('online', function() {
    console.log('Back online - processing sync queue');
    processSyncQueue();
  });
  
  window.addEventListener('offline', function() {
    console.log('Gone offline - data will be queued for sync');
  });
}
