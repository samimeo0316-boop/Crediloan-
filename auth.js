import {
  auth,
  provider
} from "./firebase.js";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Google Login
export async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    alert("Welcome " + result.user.displayName);
    window.location.href = "index.html";
  } catch (e) {
    alert(e.message);
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (e) {
    alert(e.message);
  }
}

// Current User
export function currentUser() {
  return auth.currentUser;
}

// Login Status
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Login:", user.email);
  } else {
    console.log("Logged Out");
  }
});

window.login = login;
window.logout = logout;