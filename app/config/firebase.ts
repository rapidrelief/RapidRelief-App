import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";


const firebaseConfig = {

  apiKey: "AIzaSyCq58auMbf44l5sOlPdcbx2H-f4i9yfo6I",
  authDomain: "rapidrelief-p65f25.firebaseapp.com",
  projectId: "rapidrelief-p65f25",
  storageBucket: "rapidrelief-p65f25.firebasestorage.app",
  messagingSenderId: "150778218880",
  appId: "1:150778218880:web:91718af27956b8130dd965",
  measurementId: "G-KHKSQ64EDG"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);