// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtKzbY5ct9CGRsv4piKVc2NYzmhy_HPwc",
  authDomain: "oclm-api-db.firebaseapp.com",
  projectId: "oclm-api-db",
  storageBucket: "oclm-api-db.appspot.com",
  messagingSenderId: "979973860528",
  appId: "1:979973860528:web:dbcd2d5ecb60f4c91f9f75",
  measurementId: "G-CSHX3MY08J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);