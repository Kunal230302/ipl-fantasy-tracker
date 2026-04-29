// Firebase Production Configuration
// Replace with your production Firebase config

var firebaseConfig = {
  apiKey: "AIzaSyAd0cmf4MNC1KF_G1_Q4eNeQLufxMY0H_o",
  authDomain: "fantasypointtracker.live", // Update to your domain
  projectId: "ipl-fantasy-tracker-9baf1",
  storageBucket: "ipl-fantasy-tracker-9baf1.firebasestorage.app",
  messagingSenderId: "875339224255",
  appId: "1:875339224255:web:d616bdf93abc648df7a20a"
};

// Production initialization
firebase.initializeApp(firebaseConfig);

// Additional production settings
if (window.location.hostname === "fantasypointtracker.live") {
  // Production-specific configurations
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  
  // Enable analytics if available
  if (typeof firebase.analytics !== 'undefined') {
    firebase.analytics();
  }
}
