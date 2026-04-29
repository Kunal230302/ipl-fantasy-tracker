// Hybrid Storage: localStorage + Firebase Sync
// Best of both worlds - offline support + cloud sync

// Enhanced save function with Firebase sync
function saveWithSync() {
  // Save to localStorage (for offline)
  try {
    localStorage.setItem('ipl2026_v2', JSON.stringify(state));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
  
  // Save to Firebase (for cloud sync)
  if (state.currentUser && navigator.onLine) {
    saveToFirebase();
    saveUserToFirebase();
  }
}

// Enhanced load function with Firebase sync
function loadWithSync() {
  // Load from localStorage first (fast)
  try {
    var localData = localStorage.getItem('ipl2026_v2');
    if (localData) {
      state = JSON.parse(localData);
    }
  } catch (e) {
    console.error('localStorage load failed:', e);
  }
  
  // Sync with Firebase if online
  if (state.currentUser && navigator.onLine) {
    loadFromFirebase();
    setupRealtimeSync();
  }
}

// Auto-save on data changes
function setupAutoSave() {
  // Save to localStorage immediately
  var originalSave = save;
  save = function() {
    originalSave();
    if (state.currentUser && navigator.onLine) {
      setTimeout(saveToFirebase, 1000); // Debounce Firebase save
    }
  };
}

// Handle online/offline status
function setupNetworkListener() {
  window.addEventListener('online', function() {
    console.log('Back online - syncing with Firebase');
    if (state.currentUser) {
      saveToFirebase();
      setupRealtimeSync();
    }
  });
  
  window.addEventListener('offline', function() {
    console.log('Gone offline - using localStorage only');
  });
}

// Conflict resolution (if Firebase and localStorage differ)
function resolveConflicts(firebaseData, localData) {
  // Use the most recently updated data
  if (firebaseData.lastUpdated > localData.lastUpdated) {
    return firebaseData;
  } else {
    return localData;
  }
}
