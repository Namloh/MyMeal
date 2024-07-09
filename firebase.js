// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getApps } from 'firebase/app';
import { getFirestore} from "firebase/firestore"
import { GoogleAuthProvider } from "firebase/auth";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: ``,
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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});
const signInWithPopup = () => auth.signInWithPopup(provider);  

export {auth, db, provider, signInWithPopup};