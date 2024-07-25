import firebase from "firebase";

// Your web app's Firebase configuration
const firebaseConfig = {
 <"YOUR API FIREBASECONFIG">
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
