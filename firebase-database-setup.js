// Firebase Realtime Database Setup
// Add this to your HTML after Firebase initialization

// Initialize Firebase Database
var database = firebase.database();

// Save data to Firebase
function saveToFirebase() {
  if (!state.currentUser || !state.activeGroup) return;
  
  var groupRef = database.ref('groups/' + state.activeGroup);
  groupRef.set({
    id: state.activeGroup,
    data: state.groups[state.activeGroup],
    lastUpdated: new Date().toISOString()
  });
}

// Load data from Firebase
function loadFromFirebase() {
  if (!state.currentUser || !state.activeGroup) return;
  
  var groupRef = database.ref('groups/' + state.activeGroup);
  groupRef.on('value', function(snapshot) {
    var data = snapshot.val();
    if (data && data.data) {
      state.groups[state.activeGroup] = data.data;
      renderAll();
    }
  });
}

// Save user data
function saveUserToFirebase() {
  if (!state.currentUser) return;
  
  var userRef = database.ref('users/' + state.currentUser);
  userRef.set({
    data: state.users[state.currentUser],
    lastUpdated: new Date().toISOString()
  });
}

// Real-time sync
function setupRealtimeSync() {
  if (!state.currentUser || !state.activeGroup) return;
  
  // Listen for changes
  var groupRef = database.ref('groups/' + state.activeGroup);
  groupRef.on('value', function(snapshot) {
    var data = snapshot.val();
    if (data && data.data) {
      state.groups[state.activeGroup] = data.data;
      renderAll();
    }
  });
}
