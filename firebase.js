// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeApp, getApps } from 'firebase/app';
import {getFirestore} from "firebase/firestore"


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1Pn4TS9alkiLZ9AlxYHSCTA4a5edx7v8",
  authDomain: "mymeal-d50b5.firebaseapp.com",
  projectId: "mymeal-d50b5",
  storageBucket: "mymeal-d50b5.appspot.com",
  messagingSenderId: "958515273725",
  appId: "1:958515273725:web:b774fe15c0755455a98394",
  measurementId: "G-GPBYQ95QRF"
};

// Initialize Firebase

let app;
if(getApps().length === 0){
    app = firebase.initializeApp(firebaseConfig);
}
else{
    app = firebase.app();
}
//const analytics = getAnalytics(app);
const auth = firebase.auth()
const db = getFirestore()
const googleProvider = new firebase.auth.GoogleAuthProvider();

export {auth, db, googleProvider};