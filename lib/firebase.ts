
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCozcm8f28V5b3eQz7uqFy97YjsIN_FdLg",
  authDomain: "botequinho-4698c.firebaseapp.com",
  databaseURL: "https://botequinho-4698c-default-rtdb.firebaseio.com",
  projectId: "botequinho-4698c",
  storageBucket: "botequinho-4698c.firebasestorage.app",
  messagingSenderId: "385738452580",
  appId: "1:385738452580:web:a608ecc14f8b2f2687f971"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
