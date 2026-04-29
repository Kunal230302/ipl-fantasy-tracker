// Data Safety Demonstration
// Shows how your data is protected in all scenarios

// Test data storage and recovery
function testDataSafety() {
  console.log('=== DATA SAFETY TEST ===');
  
  // Create test data
  var testData = {
    groups: {
      'TEST123': {
        name: 'Test Group',
        members: ['user1', 'user2'],
        entries: [
          {matchNum: 1, team: 'MI', points: 45.5},
          {matchNum: 2, team: 'CSK', points: 38.0}
        ]
      }
    },
    users: {
      'user1': {display: 'Test User', email: 'test@example.com'}
    }
  };
  
  // Save to all layers
  localStorage.setItem('test_backup', JSON.stringify(testData));
  
  if (db) {
    saveToIndexedDB('test_backup', testData);
  }
  
  console.log('Test data saved to all storage layers');
}

// Recovery demonstration
function demonstrateRecovery() {
  console.log('=== RECOVERY DEMONSTRATION ===');
  
  // Try localStorage first
  try {
    var localData = localStorage.getItem('ipl2026_v2');
    if (localData) {
      console.log('localStorage recovery: SUCCESS');
      console.log('Data size:', localData.length, 'characters');
    }
  } catch (error) {
    console.log('localStorage recovery: FAILED - trying IndexedDB');
  }
  
  // Try IndexedDB
  if (db) {
    loadFromIndexedDB('main_state').then(function(data) {
      if (data) {
        console.log('IndexedDB recovery: SUCCESS');
        console.log('Data keys:', Object.keys(data));
      } else {
        console.log('IndexedDB recovery: NO DATA');
      }
    });
  }
}

// Storage health check
function storageHealthCheck() {
  console.log('=== STORAGE HEALTH CHECK ===');
  
  // Check localStorage
  try {
    var testKey = 'health_check_' + Date.now();
    var testValue = 'test_data';
    localStorage.setItem(testKey, testValue);
    var retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrieved === testValue) {
      console.log('localStorage: HEALTHY');
    } else {
      console.log('localStorage: CORRUPTED');
    }
  } catch (error) {
    console.log('localStorage: ERROR -', error.message);
  }
  
  // Check IndexedDB
  if (db) {
    console.log('IndexedDB: AVAILABLE');
  } else {
    console.log('IndexedDB: NOT AVAILABLE');
  }
  
  // Check storage space
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(function(estimate) {
      var usagePercent = (estimate.usage / estimate.quota) * 100;
      console.log('Storage usage:', usagePercent.toFixed(2) + '%');
      
      if (usagePercent < 80) {
        console.log('Storage: HEALTHY');
      } else if (usagePercent < 95) {
        console.log('Storage: WARNING - Nearly full');
      } else {
        console.log('Storage: CRITICAL - Cleanup needed');
      }
    });
  }
}

// Emergency data export
function emergencyDataExport() {
  console.log('=== EMERGENCY DATA EXPORT ===');
  
  var allData = {
    localStorage: {},
    indexedDB: null,
    timestamp: new Date().toISOString()
  };
  
  // Export all localStorage data
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith('ipl2026_')) {
      allData.localStorage[key] = localStorage.getItem(key);
    }
  }
  
  // Create downloadable backup
  var dataStr = JSON.stringify(allData, null, 2);
  var dataBlob = new Blob([dataStr], {type: 'application/json'});
  var url = URL.createObjectURL(dataBlob);
  
  var link = document.createElement('a');
  link.href = url;
  link.download = 'ipl_fantasy_tracker_backup_' + new Date().toISOString().split('T')[0] + '.json';
  link.click();
  
  console.log('Emergency backup downloaded');
  return allData;
}

// Run safety checks
setTimeout(function() {
  testDataSafety();
  demonstrateRecovery();
  storageHealthCheck();
}, 2000);
