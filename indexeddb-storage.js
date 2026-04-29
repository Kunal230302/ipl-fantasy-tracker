// IndexedDB Storage - Maximum offline space
// Up to 50% of available disk space

// Open IndexedDB database
var dbName = 'IPLFantasyTracker';
var dbVersion = 1;
var db;

function initIndexedDB() {
  return new Promise((resolve, reject) => {
    var request = indexedDB.open(dbName, dbVersion);
    
    request.onerror = function() {
      reject('IndexedDB error');
    };
    
    request.onsuccess = function() {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = function(event) {
      db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Save data to IndexedDB
function saveToIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([storeName], 'readwrite');
    var store = transaction.objectStore(storeName);
    var request = store.put(data);
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

// Load data from IndexedDB
function loadFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([storeName], 'readonly');
    var store = transaction.objectStore(storeName);
    var request = store.get(id);
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

// Get all data from store
function getAllFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([storeName], 'readonly');
    var store = transaction.objectStore(storeName);
    var request = store.getAll();
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

// Check available storage space
function checkStorageSpace() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(function(estimate) {
      console.log('Available space:', estimate.quota, 'bytes');
      console.log('Used space:', estimate.usage, 'bytes');
      console.log('Free space:', estimate.quota - estimate.usage, 'bytes');
    });
  }
}
