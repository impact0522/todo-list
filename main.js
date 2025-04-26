/**
 * Abstract class for formatting todo items.
 * Provides methods to format task descriptions, due dates, and status.
 */
class TodoItemFormatter {
    /**
     * Formats the task description, truncating it if it exceeds 14 characters.
     * @param {string} task - The task description to format.
     * @returns {string} The formatted task description.
     */
    formatTask(task) {
        return task.length > 14 ? task.slice(0, 14) + "..." : task;
    }

    /**
     * Formats the due date, returning a default message if no date is provided.
     * @param {string} dueDate - The due date in string format.
     * @returns {string} The formatted due date or "No due date" if none.
     */
    formatDueDate(dueDate) {
        return dueDate || "No due date";
    }

    /**
     * Formats the completion status of a task.
     * @param {boolean} completed - The completion status of the task.
     * @returns {string} "Completed" if true, "Pending" if false.
     */
    formatStatus(completed) {
        return completed ? "Completed" : "Pending";
    }
}

/**
 * Class responsible for managing todo items, including adding, editing, and filtering tasks.
 * Stores todos in localStorage.
 */
class TodoManager {
    /**
     * Creates a new TodoManager instance.
     * @param {TodoItemFormatter} todoItemFormatter - Formatter for todo items.
     */
    constructor(todoItemFormatter) {
        this.todos = JSON.parse(localStorage.getItem("todos")) || [];
        this.todoItemFormatter = todoItemFormatter;
    }

    /**
     * Adds a new todo item to the list.
     * @param {string} task - The task description.
     * @param {string} dueDate - The due date for the task.
     * @returns {Object} The newly created todo item.
     */
    addTodo(task, dueDate) {
        const newTodo = {
            id: this.getRandomId(),
            task: this.todoItemFormatter.formatTask(task),
            dueDate: this.todoItemFormatter.formatDueDate(dueDate),
            completed: false,
            status: "pending",
        };
        this.todos.push(newTodo);
        this.saveToLocalStorage();
        return newTodo;
    }

    /**
     * Edits an existing todo item by ID.
     * @param {string} id - The ID of the todo to edit.
     * @param {string} updatedTask - The updated task description.
     * @returns {Object|undefined} The updated todo item or undefined if not found.
     */
    editTodo(id, updatedTask) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.task = updatedTask;
            this.saveToLocalStorage();
        }
        return todo;
    }

    /**
     * Deletes a todo item by ID.
     * @param {string} id - The ID of the todo to delete.
     */
    deleteTodo(id) {
        this.todos = this.todos.filter((todo) => todo.id !== id);
        this.saveToLocalStorage();
    }

    /**
     * Toggles the completion status of a todo item.
     * @param {string} id - The ID of the todo to toggle.
     */
    toggleTodoStatus(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
        }
    }

    /**
     * Clears all todo items.
     */
    clearAllTodos() {
        if (this.todos.length > 0) {
            this.todos = [];
            this.saveToLocalStorage();
        }
    }

    /**
     * Filters todos based on status.
     * @param {string} status - The status to filter by ("all", "pending", "completed").
     * @returns {Array} The filtered list of todos.
     */
    filterTodos(status) {
        switch (status) {
            case "all":
                return this.todos;
            case "pending":
                return this.todos.filter((todo) => !todo.completed);
            case "completed":
                return this.todos.filter((todo) => todo.completed);
            default:
                return [];
        }
    }

    /**
     * Generates a random ID for a todo item.
     * @returns {string} A random string ID.
     */
    getRandomId() {
        return (
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        );
    }

    /**
     * Saves the current todos to localStorage.
     */
    saveToLocalStorage() {
        localStorage.setItem("todos", JSON.stringify(this.todos));
    }
}

/**
 * Class responsible for managing the user interface and handling events.
 */
class UIManager {
    /**
     * Creates a new UIManager instance.
     * @param {TodoManager} todoManager - The todo manager instance.
     * @param {TodoItemFormatter} todoItemFormatter - Formatter for todo items.
     */
    constructor(todoManager, todoItemFormatter) {
        this.todoManager = todoManager;
        this.todoItemFormatter = todoItemFormatter;
        this.taskInput = document.querySelector("input");
        this.dateInput = document.querySelector(".schedule-date");
        this.addBtn = document.querySelector(".add-task-button");
        this.todosListBody = document.querySelector(".todos-list-body");
        this.alertMessage = document.querySelector(".alert-message");
        this.deleteAllBtn = document.querySelector(".delete-all-btn");

        this.addEventListeners();
        this.showAllTodos();
    }

    /**
     * Adds event listeners for UI interactions.
     */
    addEventListeners() {
        this.addBtn.addEventListener("click", () => {
            this.handleAddTodo();
        });

        this.taskInput.addEventListener("keyup", (e) => {
            if (e.keyCode === 13 && this.taskInput.value.length > 0) {
                this.handleAddTodo();
            }
        });

        this.deleteAllBtn.addEventListener("click", () => {
            this.handleClearAllTodos();
        });

        const filterButtons = document.querySelectorAll(".todos-filter li");
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const status = button.textContent.toLowerCase();
                this.handleFilterTodos(status);
            });
        });
    }

    /**
     * Handles adding a new todo item.
     */
    handleAddTodo() {
        const task = this.taskInput.value;
        const dueDate = this.dateInput.value;
        if (task === "") {
            this.showAlertMessage("Please enter a task", "error");
        } else {
            const newTodo = this.todoManager.addTodo(task, dueDate);
            this.showAllTodos();
            this.taskInput.value = "";
            this.dateInput.value = "";
            this.showAlertMessage("Task added successfully", "success");
        }
    }

    /**
     * Handles clearing all todos.
     */
    handleClearAllTodos() {
        this.todoManager.clearAllTodos();
        this.showAllTodos();
        this.showAlertMessage("All todos cleared successfully", "success");
    }

    /**
     * Displays all todos.
     */
    showAllTodos() {
        const todos = this.todoManager.filterTodos("all");
        this.displayTodos(todos);
    }

    /**
     * Renders the list of todos to the UI.
     * @param {Array} todos - The list of todos to display.
     */
    displayTodos(todos) {
        this.todosListBody.innerHTML = "";

        if (todos.length === 0) {
            this.todosListBody.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
            return;
        }

        todos.forEach((todo) => {
            this.todosListBody.innerHTML += `
          <tr class="todo-item" data-id="${todo.id}">
            <td>${this.todoItemFormatter.formatTask(todo.task)}</td>
            <td>${this.todoItemFormatter.formatDueDate(todo.dueDate)}</td>
            <td>${this.todoItemFormatter.formatStatus(todo.completed)}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="uiManager.handleEditTodo('${todo.id}')">
                <i class="bx bx-edit-alt bx-bx-xs"></i>    
              </button>
              <button class="btn btn-success btn-sm" onclick="uiManager.handleToggleStatus('${todo.id}')">
                <i class="bx bx-check bx-xs"></i>
              </button>
              <button class="btn btn-error btn-sm" onclick="uiManager.handleDeleteTodo('${todo.id}')">
                <i class="bx bx-trash bx-xs"></i>
              </button>
            </td>
          </tr>
        `;
        });
    }

    /**
     * Handles editing a todo item.
     * @param {string} id - The ID of the todo to edit.
     */
    handleEditTodo(id) {
        const todo = this.todoManager.todos.find((t) => t.id === id);
        if (todo) {
            this.taskInput.value = todo.task;
            this.todoManager.deleteTodo(id);

            const handleUpdate = () => {
                this.addBtn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
                this.showAlertMessage("Todo updated successfully", "success");
                this.showAllTodos();
                this.addBtn.removeEventListener("click", handleUpdate);
            };

            this.addBtn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
            this.addBtn.addEventListener("click", handleUpdate);
        }
    }

    /**
     * Handles toggling the status of a todo item.
     * @param {string} id - The ID of the todo to toggle.
     */
    handleToggleStatus(id) {
        this.todoManager.toggleTodoStatus(id);
        this.showAllTodos();
    }

    /**
     * Handles deleting a todo item.
     * @param {string} id - The ID of the todo to delete.
     */
    handleDeleteTodo(id) {
        this.todoManager.deleteTodo(id);
        this.showAlertMessage("Todo deleted successfully", "success");
        this.showAllTodos();
    }

    /**
     * Handles filtering todos by status.
     * @param {string} status - The status to filter by.
     */
    handleFilterTodos(status) {
        const filteredTodos = this.todoManager.filterTodos(status);
        this.displayTodos(filteredTodos);
    }

    /**
     * Displays an alert message to the user.
     * @param {string} message - The message to display.
     * @param {string} type - The type of alert ("success" or "error").
     */
    showAlertMessage(message, type) {
        const alertBox = `
  <div class="alert alert-${type} shadow-lg mb-5 w-full">
    <div>
      <span>${message}</span>
    </div>
  </div>
`;
        this.alertMessage.innerHTML = alertBox;
        this.alertMessage.classList.remove("hide");
        this.alertMessage.classList.add("show");
        setTimeout(() => {
            this.alertMessage.classList.remove("show");
            this.alertMessage.classList.add("hide");
        }, 3000);
    }
}

/**
 * Class responsible for managing theme switching.
 */
class ThemeSwitcher {
    /**
     * Creates a new ThemeSwitcher instance.
     * @param {NodeList} themes - The list of theme elements.
     * @param {HTMLElement} html - The HTML element to apply themes to.
     */
    constructor(themes, html) {
        this.themes = themes;
        this.html = html;
        this.init();
    }

    /**
     * Initializes the theme switcher by applying saved theme.
     */
    init() {
        const theme = this.getThemeFromLocalStorage();
        if (theme) {
            this.setTheme(theme);
        }

        this.addThemeEventListeners();
    }

    /**
     * Adds event listeners for theme selection.
     */
    addThemeEventListeners() {
        this.themes.forEach((theme) => {
            theme.addEventListener("click", () => {
                const themeName = theme.getAttribute("theme");
                this.setTheme(themeName);
                this.saveThemeToLocalStorage(themeName);
            });
        });
    }

    /**
     * Sets the active theme.
     * @param {string} themeName - The name of the theme to apply.
     */
    setTheme(themeName) {
        this.html.setAttribute("data-theme", themeName);
    }

    /**
     * Saves the selected theme to localStorage.
     * @param {string} themeName - The name of the theme to save.
     */
    saveThemeToLocalStorage(themeName) {
        localStorage.setItem("theme", themeName);
    }

    /**
     * Retrieves the saved theme from localStorage.
     * @returns {string|null} The saved theme name or null if none.
     */
    getThemeFromLocalStorage() {
        return localStorage.getItem("theme");
    }
}

/**
 * Instantiates the application classes and initializes the app.
 */
const todoItemFormatter = new TodoItemFormatter();
const todoManager = new TodoManager(todoItemFormatter);
const uiManager = new UIManager(todoManager, todoItemFormatter);
const themes = document.querySelectorAll(".theme-item");
const html = document.querySelector("html");
const themeSwitcher = new ThemeSwitcher(themes, html);