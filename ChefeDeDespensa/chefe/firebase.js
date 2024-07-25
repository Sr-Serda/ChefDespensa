import firebase from "firebase";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd-GZw1I9B-Vbn6t8WEovsx8303cTXCk4",
  authDomain: "chefe-685b2.firebaseapp.com",
  databaseURL: "https://chefe-685b2-default-rtdb.firebaseio.com",
  projectId: "chefe-685b2",
  storageBucket: "chefe-685b2.appspot.com",
  messagingSenderId: "458923499304",
  appId: "1:458923499304:web:b13723caf84c2c4c55fa1d",
  measurementId: "G-GV3RLHWBVV",
};

// Initialize Firebase
try {
  const app = firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized:', app.name);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const firestore = firebase.firestore();

const auth = firebase.auth();

export { auth };
