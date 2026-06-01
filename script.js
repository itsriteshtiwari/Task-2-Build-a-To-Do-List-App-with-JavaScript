// DOM Elements
const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const currentDateSpan = document.getElementById('currentDate');
const totalCountSpan = document.getElementById('totalCount');
const doneCountSpan = document.getElementById('doneCount');
const remainingCountSpan = document.getElementById('remainingCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Initialize state
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Set current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDateSpan.textContent = new Date().toLocaleDateString('en-US', options);

// Functions for persistence and rendering
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(task => task.completed).length;
    totalCountSpan.textContent = total;
    doneCountSpan.textContent = done;
    remainingCountSpan.textContent = total - done;
}

function renderTasks() {
    // Clear the current list
    taskList.innerHTML = '';

    // Filter tasks based on currentFilter
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'done') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'high priority') {
        filteredTasks = tasks.filter(task => task.priority === 'high');
    }

    // Sort to keep "Done" tasks at the bottom
    filteredTasks.sort((a, b) => a.completed - b.completed || b.id - a.id);

    // Create and append task elements
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        // Create inner elements
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'task-item-check';
        check.checked = task.completed;
        check.addEventListener('change', () => toggleTaskComplete(task.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge ${task.priority}-priority`;
        priorityBadge.textContent = task.priority;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = new Date(task.id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-item-delete';
        deleteBtn.innerHTML = '&#x1F5D1;'; // Trash can icon
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Assemble task item
        contentDiv.appendChild(check);
        contentDiv.appendChild(textSpan);
        metaDiv.appendChild(priorityBadge);
        metaDiv.appendChild(dateSpan);
        li.appendChild(contentDiv);
        li.appendChild(metaDiv);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    updateStats();
}

// Functionality for CRUD and state
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Please enter a task description.');
        return;
    }

    const newTask = {
        id: Date.now(), // Unique ID using timestamp
        text: text,
        priority: priorityInput.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    
    // Reset inputs
    taskInput.value = '';
    priorityInput.selectedIndex = 0;
}

function toggleTaskComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasksToStorage();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    renderTasks();
}

function filterTasks(e) {
    currentFilter = e.target.dataset.filter;
    // Update active button style
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToStorage();
    renderTasks();
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});
filterBtns.forEach(btn => btn.addEventListener('click', filterTasks));
clearCompletedBtn.addEventListener('click', clearCompleted);

// Initial render
renderTasks();