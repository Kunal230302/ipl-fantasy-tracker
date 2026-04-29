// Cache API Storage - Service Worker for offline
// Large storage with background sync

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('Service Worker registered');
  });
}

// Save data to cache
async function saveToCache(key, data) {
  try {
    const cache = await caches.open('ipl-fantasy-data');
    const response = new Response(JSON.stringify(data));
    await cache.put(key, response);
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

// Load data from cache
async function loadFromCache(key) {
  try {
    const cache = await caches.open('ipl-fantasy-data');
    const response = await cache.match(key);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Cache load error:', error);
  }
  return null;
}

// Background sync when online
async function syncToCloud(data) {
  if (navigator.onLine) {
    try {
      // Sync to Firebase when online
      await saveToFirebase(data);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}

// Check storage quota
async function checkQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota - estimate.usage
    };
  }
}
