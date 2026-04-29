// Firebase Firestore Setup
// Modern NoSQL database with better querying

// Initialize Firestore
var db = firebase.firestore();

// Save group data to Firestore
async function saveGroupToFirestore() {
  if (!state.currentUser || !state.activeGroup) return;
  
  try {
    await db.collection('groups').doc(state.activeGroup).set({
      ...state.groups[state.activeGroup],
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Group saved to Firestore');
  } catch (error) {
    console.error('Error saving group:', error);
  }
}

// Load group data from Firestore
async function loadGroupFromFirestore() {
  if (!state.currentUser || !state.activeGroup) return;
  
  try {
    var doc = await db.collection('groups').doc(state.activeGroup).get();
    if (doc.exists) {
      state.groups[state.activeGroup] = doc.data();
      renderAll();
    }
  } catch (error) {
    console.error('Error loading group:', error);
  }
}

// Real-time listener for group updates
function setupGroupListener() {
  if (!state.currentUser || !state.activeGroup) return;
  
  db.collection('groups').doc(state.activeGroup)
    .onSnapshot(function(doc) {
      if (doc.exists) {
        state.groups[state.activeGroup] = doc.data();
        renderAll();
      }
    });
}

// Save user data
async function saveUserToFirestore() {
  if (!state.currentUser) return;
  
  try {
    await db.collection('users').doc(state.currentUser).set({
      ...state.users[state.currentUser],
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving user:', error);
  }
}
