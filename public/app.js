// TaskForce App - Frontend JavaScript

const API_URL = '/api/tasks';

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const addTaskForm = document.getElementById('addTaskForm');
    const newTaskInput = document.getElementById('newTaskInput');

    // Taken ophalen van de API
    async function fetchTasks() {
        try {
            const response = await fetch(API_URL);
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Fout bij ophalen taken:', error);
        }
    }

    // Taken renderen
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item${task.completed ? ' completed' : ''}`;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <input type="checkbox" id="task${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <label for="task${task.id}" class="task-label">${escapeHtml(task.title)}</label>
                <button class="delete-btn" data-id="${task.id}" title="Verwijderen">×</button>
            `;
            
            taskList.appendChild(li);
        });
        
        updateStats(tasks);
    }

    // HTML escapen voor veiligheid
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Statistieken updaten
    function updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
    }

    // Taak status toggler
    async function toggleTask(id) {
        try {
            const response = await fetch(`${API_URL}/${id}/toggle`, {
                method: 'PATCH'
            });
            
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Fout bij updaten taak:', error);
        }
    }

    // Nieuwe taak toevoegen
    async function addTask(title) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            });
            
            if (response.ok) {
                fetchTasks();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Fout bij toevoegen taak:', error);
            return false;
        }
    }

    // Taak verwijderen
    async function deleteTask(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Fout bij verwijderen taak:', error);
        }
    }

    // Event: Checkbox klikken
    taskList.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const taskItem = e.target.closest('.task-item');
            const id = parseInt(taskItem.dataset.id);
            toggleTask(id);
        }
    });

    // Event: Verwijder knop klikken
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            deleteTask(id);
        }
    });

    // Event: Nieuwe taak formulier
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = newTaskInput.value.trim();
            
            if (title) {
                const success = await addTask(title);
                if (success) {
                    newTaskInput.value = '';
                }
            }
        });
    }

    // Initialisatie: taken ophalen
    fetchTasks();
});
