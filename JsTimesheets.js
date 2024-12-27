/***************************************
 * Firebase – inicjalizacja 
 * (korzystamy z firebaseConfig z pliku firebase-config.js)
 ***************************************/
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

/* ===================================
   Wczytywanie danych z Firebase
   (Timesheets -> Rotations -> Projects)
=================================== */

async function loadTimesheets() {
  try {
    // Referencja do kolekcji "Timesheets"
    const timesheetsRef = db.collection("Timesheets");
    const timesheetsSnapshot = await timesheetsRef.get();

    // Szukamy w dokumencie HTML jakiegoś kontenera na kafelki
    // np. <div id="tiles-container"></div>
    const container = document.getElementById("tiles-container");

    // Zwróć uwagę: timesheetsSnapshot.docs to tablica dokumentów
    for (const timesheetDoc of timesheetsSnapshot.docs) {
      const timesheetData = timesheetDoc.data();
      const { Status, Date, RotationID } = timesheetData;

      let projectName = "";

      // rotationSnap – dokument w kolekcji "Rotations" 
      // (RotationID w Firebase jest polem typu DocumentReference, 
      //  więc żeby się do niego dostać, wystarczy rotationRef.get())
      if (RotationID) {
        const rotationSnap = await RotationID.get(); 
        if (rotationSnap.exists) {
          const rotationData = rotationSnap.data();
          const { RefProjectID } = rotationData;

          // projectSnap – dokument w kolekcji "Projects" 
          if (RefProjectID) {
            const projectSnap = await RefProjectID.get();
            if (projectSnap.exists) {
              const projectData = projectSnap.data();
              projectName = projectData.ProjectName || "";
            }
          }
        }
      }

      // Mając Status, Date i projectName, tworzymy kafelek
      createTile(container, Status, Date, projectName);
     // createTile(container, "Approved", "2024-12-24", "Project Gamma");
    }

  } catch (error) {
    console.error("Błąd przy wczytywaniu Timesheets:", error);
  }
}


async function fetchAndLogFirestoreData() {
  try {
    const collectionRef = db.collection("Timesheets"); // Zmień "Timesheets" na swoją kolekcję
    const snapshot = await collectionRef.get();
    
    const jsonData = [];
    
    snapshot.forEach((doc) => {
      jsonData.push({
        id: doc.id,       // ID dokumentu
        ...doc.data()     // Dane dokumentu
      });
    });
    
    console.log(JSON.stringify(jsonData, null, 2)); // Wypisz dane w formacie JSON
  } catch (error) {
    console.error("Błąd podczas pobierania danych z Firestore:", error);
  }
}

// Wywołanie funkcji
fetchAndLogFirestoreData();

/**
 * Funkcja pomocnicza do tworzenia kafelków na stronie.
 * Ustawiamy data-status, data-date i data-project,
 * aby Twoja logika filtrów mogła z nich korzystać.
 */
function createTile(containerElement, status, date, projectName) {
  
    // Sprawdzamy, czy `date` jest obiektem Timestamp
    if (date && typeof date.toDate === "function") {
      formattedDate = date.toDate().toISOString().split('T')[0];
    } else if (typeof date === "string") {
      // Jeśli `date` to string, przyjmujemy, że już jest w formacie `YYYY-MM-DD`
      formattedDate = date;
    } else {
      // Jeśli `date` jest czymś innym (null, undefined itp.)
      formattedDate = "Unknown Date";
    }

  // Tworzymy div z klasą .tile
  const tile = document.createElement("div");
  tile.classList.add("tile");

 

  // Ustawiamy dataset zgodnie z Twoją logiką filtrów
  tile.dataset.status = status;
  tile.dataset.date = formattedDate;
  tile.dataset.project = projectName;

  // Zawartość kafelka
  tile.innerHTML = `
  <div class="tile-content">
    <!-- Tu data i nazwa projektu -->
    <span class="project-date">${formattedDate}</span>
    <span class="project-name">${projectName}</span>
  </div>

  <!-- Status chip (jeśli masz .status-chip w CSS) -->
  <span class="status-chip ${status.toLowerCase()}">${status}</span>

  <!-- Przycisk edycji -->
  <button class="edit-button" onclick="navigateToEdit(this)">✏️</button>
`;

  // Dodaj kafelek do kontenera
  containerElement.appendChild(tile);
}

/* 
  Na koniec – wywołujemy loadTimesheets() po załadowaniu strony 
  (lub w dogodnym momencie).
*/
window.addEventListener("DOMContentLoaded", () => {
  loadTimesheets();
});

/* ===================================
   Web Components: Header & Footer
   + navigateToEdit(button)
=================================== */
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
        <a href="MainPage.html" style="text-decoration: none; color: black;">
          <span style="font-size: 24px; cursor: pointer;">&#8592;</span>
        </a>
        <span style="font-size: 20px; font-weight: bold;">My Timesheets</span>
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

/** 
 * Kliknięcie w przycisk "✏️" w kafelku.
 * Odczytujemy data-project i data-date, a następnie przekierowujemy do TimesheetsEdit.html.
 */
function navigateToEdit(button) {
  const tile = button.closest('.tile');
  const projectName = tile.dataset.project;
  const projectDate = tile.dataset.date;
  const url = `TimesheetsEdit.html?date=${encodeURIComponent(projectDate)}&project=${encodeURIComponent(projectName)}`;
  window.location.href = url;
}


/* ===================================
   Logika filtrów + wyświetlanie kafelków
=================================== */

// Zmienna do przechowywania WYBRANYCH statusów (może być wiele).
let selectedStatuses = [];

// Zmienna do przechowywania WYBRANEGO zakresu dat.
let selectedDateRange = "";

/**
 * Toggle wielokrotny dla statusów (Draft/Submitted/Approved).
 */
function toggleStatus(element) {
  const statusValue = element.getAttribute("data-value");
  const isActive = element.classList.contains("active");

  if (isActive) {
    element.classList.remove("active");
    selectedStatuses = selectedStatuses.filter(st => st !== statusValue);
  } else {
    element.classList.add("active");
    selectedStatuses.push(statusValue);
  }

  filterTiles();
}

/**
 * Toggle jednorazowy dla zakresu dat (Today, This Week, etc.).
 */
function toggleDate(element) {
  const dateValue = element.getAttribute("data-value");
  const isActive = element.classList.contains("active");

  // Wyłącz wszystkie chipy w .date-filters
  document.querySelectorAll(".date-filters .chip").forEach(chip => {
    chip.classList.remove("active");
  });
  // Ukryj sekcję custom date-range
  document.getElementById("custom-date-range").style.display = "none";

  if (isActive) {
    // Jeśli był aktywny -> oznacza brak filtra
    selectedDateRange = "";
  } else {
    // Ustawiamy chip na active
    element.classList.add("active");
    selectedDateRange = dateValue;

    // Jeżeli wybrano "custom", to pokaż pola "From" i "To"
    if (dateValue === "custom") {
      document.getElementById("custom-date-range").style.display = "flex";
    }
  }

  filterTiles();
}

/**
 * Główna funkcja filtrująca kafelki.
 * - Wybór statusów (selectedStatuses[])
 * - Zakres dat (selectedDateRange)
 * - Globalny filtr tekstowy (#global-filter) -> wyszukuje w: project, status, date
 */
function filterTiles() {
  const globalInput = document.getElementById("global-filter").value.toLowerCase();

  const fromInput = document.getElementById("custom-from").value;
  const toInput   = document.getElementById("custom-to").value;

  const now = new Date();
  let startRange = null;
  let endRange = null;

  switch (selectedDateRange) {
    case "today":
      startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endRange   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case "this-week":
      const dayOfWeek = now.getDay(); 
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startRange = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - mondayOffset
      );
      endRange = new Date(
        startRange.getFullYear(),
        startRange.getMonth(),
        startRange.getDate() + 6,
        23, 59, 59
      );
      break;
    case "this-month":
      startRange = new Date(now.getFullYear(), now.getMonth(), 1);
      endRange   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "this-year":
      startRange = new Date(now.getFullYear(), 0, 1);
      endRange   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case "custom":
      // obsłużymy poniżej z fromInput i toInput
      break;
    default:
      // brak filtra dat
      break;
  }

  document.querySelectorAll(".tile").forEach(tile => {
    const tileProject = tile.dataset.project.toLowerCase(); 
    const tileStatus  = tile.dataset.status.toLowerCase();   
    const tileDateStr = tile.dataset.date;                   
    const tileDateObj = new Date(tileDateStr);

    // 1. Filtr statusu
    let matchStatus = true;
    if (selectedStatuses.length > 0) {
      const statusesLower = selectedStatuses.map(s => s.toLowerCase());
      matchStatus = statusesLower.includes(tileStatus);
    }

    // 2. Filtr dat
    let matchDate = true;
    if (selectedDateRange) {
      if (selectedDateRange === "custom") {
        const fromDate = fromInput ? new Date(fromInput) : null;
        const toDate   = toInput   ? new Date(toInput)   : null;
        if (fromDate && tileDateObj < fromDate) {
          matchDate = false;
        }
        if (toDate) {
          const toDateEndOfDay = new Date(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate(),
            23, 59, 59
          );
          if (tileDateObj > toDateEndOfDay) {
            matchDate = false;
          }
        }
      } else {
        if (startRange && tileDateObj < startRange) matchDate = false;
        if (endRange && tileDateObj > endRange)     matchDate = false;
      }
    }

    // 3. Globalny filtr tekstowy
    let matchGlobal = true;
    if (globalInput) {
      const tileDateLower = tileDateStr.toLowerCase();
      if (
        !tileProject.includes(globalInput) &&
        !tileStatus.includes(globalInput) &&
        !tileDateLower.includes(globalInput)
      ) {
        matchGlobal = false;
      }
    }

    // Ostateczna decyzja: pokazać kafelek czy schować
    if (matchStatus && matchDate && matchGlobal) {
      tile.style.display = "";
    } else {
      tile.style.display = "none";
    }
  });
}

/** 
 * Reset wszystkich filtrów.
 */
function resetFilters() {
  // Czyścimy tablicę statusów i chipy
  selectedStatuses = [];
  document.querySelectorAll(".status-filters .chip").forEach(chip => {
    chip.classList.remove("active");
  });

  // Czyścimy date range i chipy
  selectedDateRange = "";
  document.querySelectorAll(".date-filters .chip").forEach(chip => {
    chip.classList.remove("active");
  });
  // Ukryj sekcję custom
  document.getElementById("custom-date-range").style.display = "none";
  document.getElementById("custom-from").value = "";
  document.getElementById("custom-to").value   = "";

  // Czyścimy pole globalnego wyszukiwania
  document.getElementById("global-filter").value = "";

  // Ponownie filtrujemy (bez żadnych ograniczeń)
  filterTiles();
}
