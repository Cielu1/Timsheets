class HeaderComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .header {
          background-color: #e0e0e0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 25px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          box-sizing: border-box;
        }
        .hamburger div {
          width: 30px;
          height: 3px;
          background-color: #0078d7;
          border-radius: 5px;
        }
      </style>
      <div class="header">
        <a href="Timesheets.html" style="text-decoration: none; color: black;">
          <span style="font-size: 24px; cursor: pointer;">&#8592;</span>
        </a>
        <span style="font-size: 20px; font-weight: bold;">Edit Timesheet</span>
        <button class="hamburger">
          <div></div>
          <div></div>
          <div></div>
        </button>
      </div>
    `;
  }
}

class FooterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .footer {
          background-color: #e0e0e0;
          height: 60px;
          position: fixed;
          bottom: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
        }
      </style>
      <div class="footer">
        <p>&copy; 2023 Your Company</p>
      </div>
    `;
  }
}

customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);

// Firebase – inicjalizacja
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// Wczytywanie danych z Firebase
async function loadTasks() {
  const container = document.getElementById("tasks-container");
  const timesheetId = sessionStorage.getItem("timesheetId");

  if (!container || !timesheetId) {
    container.innerHTML = "<p>No Timesheet ID found.</p>";
    return;
  }

  container.innerHTML = "";

  try {
    const tasksSnapshot = await db.collection("Timesheets").doc(timesheetId).collection("Tasks").get();
    tasksSnapshot.forEach((taskDoc) => {
      const taskData = taskDoc.data();
      createTaskTile(
        container,
        taskData.TaskName,
        taskData.TaskStart.toDate(),
        taskData.TaskEnd.toDate()
      );
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
    container.innerHTML = "<p>Failed to load tasks.</p>";
  }
}

function createTaskTile(container, taskName, taskStart, taskEnd) {
  const taskTile = document.createElement("div");
  taskTile.classList.add("timesheet-task");
  taskTile.innerHTML = `
    <div class="task-content">
      <span class="task-name">${taskName}</span>
      <span class="task-time">${taskStart.toLocaleString()} - ${taskEnd.toLocaleString()}</span>
    </div>
  `;
  container.appendChild(taskTile);
}

// Ładowanie danych po załadowaniu strony
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  // Obsługa formularza w popupie
  const form = document.getElementById("addTaskForm");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const taskName = document.getElementById("taskName").value;
      const taskStart = document.getElementById("taskStart").value;
      const taskEnd = document.getElementById("taskEnd").value;
      const taskDescription = document.getElementById("taskDescription").value;

      if (new Date(taskStart) >= new Date(taskEnd)) {
        return; // Nieprawidłowe daty
      }

      const timesheetId = sessionStorage.getItem("timesheetId");
      if (!timesheetId) return;

      try {
        await db.collection("Timesheets")
          .doc(timesheetId)
          .collection("Tasks")
          .add({
            TaskName: taskName,
            TaskStart: firebase.firestore.Timestamp.fromDate(new Date(taskStart)),
            TaskEnd: firebase.firestore.Timestamp.fromDate(new Date(taskEnd)),
            TaskDescription: taskDescription,
          });

        closePopup();
        loadTasks();
      } catch (error) {
        console.error("Error adding task:", error);
      }
    });
  }
});

// Funkcje otwierania i zamykania popupu
function openPopup() {
  const popup = document.getElementById("custom-popup");
  if (popup) popup.classList.remove("hidden");
}

function closePopup() {
  const popup = document.getElementById("custom-popup");
  if (popup) popup.classList.add("hidden");
}
