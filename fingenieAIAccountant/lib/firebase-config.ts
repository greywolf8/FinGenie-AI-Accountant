import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC19DB_phEP5A3VMWOqYewtw1H0BWEpYbo",
  authDomain: "fingenie-4b775.firebaseapp.com",
  projectId: "fingenie-4b775",
  storageBucket: "fingenie-4b775.appspot.com",
  messagingSenderId: "438681940907",
  appId: "1:438681940907:web:1560226c10b18182ca58ee",
  measurementId: "G-ZTH1B48KD7",
}

// Initialize Firebase
let firebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApps()[0]
}

// Initialize Firestore
const db = getFirestore(firebaseApp)

export { db, firebaseApp }

