// Plik: JsTimesheetsEdit.js
// =========================================================
// Moduł Firebase (importy) + konfiguracja + funkcja loadTask()
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDva-kLs2iZwoRRiDzZOMHykmi9OK0oIFc",
  authDomain: "retsot-timesheet.firebaseapp.com",
  projectId: "retsot-timesheet",
  storageBucket: "retsot-timesheet.firebasestorage.app",
  messagingSenderId: "530894693118",
  appId: "1:530894693118:web:c41c5119819fae2b90bbaf",
  measurementId: "G-PNRYJTXYCF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadTask() {
  try {
    const taskRef = doc(db, "Timesheets", "1", "Tasks", "1");
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      document.getElementById("task-name").textContent  = `Task Name: ${taskData["TaskName"]}`;
      document.getElementById("task-start").textContent = `Task Start: ${new Date(taskData["TaskStart"].seconds * 1000).toLocaleString()}`;
      document.getElementById("task-end").textContent   = `Task End: ${new Date(taskData["TaskEnd"].seconds * 1000).toLocaleString()}`;
    } else {
      document.getElementById("task-name").textContent = "Task not found.";
    }
  } catch (error) {
    console.error("Error fetching task data:", error);
    document.getElementById("task-name").textContent = "Error loading task.";
  }
}

document.addEventListener("DOMContentLoaded", loadTask);
