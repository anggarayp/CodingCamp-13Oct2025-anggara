// === Select elements from HTML ===
const form = document.querySelector(".todo-form");
const taskInput = document.querySelector(".task-input");
const dateInput = document.querySelector(".date-input");
const todoList = document.querySelector(".todo-list");
const remainingText = document.querySelector(".remaining strong");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.querySelector(".search-input");

// === Main Data Storage ===
let todosDB = [];

// === Event Listeners ===
function bindEvents() {
  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
  });

  // Handle filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active").classList.remove("active");
      btn.classList.add("active");

      const filter = btn.textContent.trim();
      renderTodos(filter);
    });
  });

  // Search input
  searchInput.addEventListener("input", () => {
    const filter = document.querySelector(".filter-btn.active").textContent.trim();
    renderTodos(filter);
  });
}

// === Add new Todo ===
function addTodo() {
  const text = taskInput.value.trim(); // takes what inside the input text box and remove extra spaces
  const dueDate = dateInput.value; // takes the date from input date

  // Input validation
  if (!text || !dueDate) {
    alert("Please add a task and select a date.");
    return;
  }

  // Create todo list object
  const todo = {
    id: Date.now(),
    text,
    dueDate,
    completed: false,
  };

  // Add to todos list db array
  todosDB.push(todo);
  // Save to LocalStorage
  saveTodos();

  // Clear form
  taskInput.value = "";
  dateInput.value = "";

  // Re-render
  renderTodos(document.querySelector(".filter-btn.active").textContent.trim());
}

// === Save to LocalStorage ===
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todosDB));

// localStorage is built into the browser (no extra setup needed) 
// and lets you save data permanently even after refresh pages
}

// === Load from LocalStorage ===
function loadTodos() {
  const data = localStorage.getItem("todos");
  if (data) {
    todosDB = JSON.parse(data);
  }
}

// === Render Todo List ===
function renderTodos(filter) {
    todoList.innerHTML = ""; // Clears previous list
    const todayDate = new Date().toISOString().split("T")[0];

    // Filter buttons logic
    const searchTerm = searchInput.value.toLowerCase();

    // Search through array todosDB
    const filteredTodos = todosDB.filter((todo) => {
        const matchesFilter =
            (filter === "All") ||       // show everything
            (filter === "Active" && !todo.completed) ||     // task not yet completed
            (filter === "Complete" && todo.completed) ||    // task completed
            (filter === "Today" && todo.dueDate === today && !todo.completed) ||    // task due today
            (filter === "Upcoming" && todo.dueDate > today && !todo.completed);     // future tasks incomplete

        // Checks user inputed in search bar
        const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
        // Show the search result
        return matchesFilter && matchesSearch;
    });

    // Render filtered todos
    filteredTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item" + (todo.completed ? " completed" : "");

        li.innerHTML = `
        <label class="todo-row">
            <input type="checkbox" ${todo.completed ? "checked" : ""}>
            <span class="todo-text">${todo.text}</span>
        </label>
        <div class="todo-meta">
            <time datetime="${todo.dueDate}">
            ${new Date(todo.dueDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            </time>
            <button class="btn btn-delete" title="Delete task">✕</button>
        </div>
        `;

        // Toggle complete
        li.querySelector("input[type='checkbox']").addEventListener("change", () => {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos(filter);
        });    

        // Delete todo
        li.querySelector(".btn-delete").addEventListener("click", () => {
        todosDB = todosDB.filter((t) => t.id !== todo.id);
        saveTodos();
        renderTodos(filter);
        });

        todoList.appendChild(li);
    });

    updateRemaining();
}

// === Update Remaining Tasks ===
function updateRemaining() {
  const remaining = todosDB.filter((todo) => !todo.completed).length;
  remainingText.textContent = remaining;
}

// === Initialize App ===
function init() {
  loadTodos();
  bindEvents();
  renderTodos("All");
}

// === Start App ===
init();
