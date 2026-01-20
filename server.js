const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initiële taken data
const initialTasks = [
    { id: 1, title: 'Project documentatie schrijven', completed: false },
    { id: 2, title: 'Code review voor team uitvoeren', completed: false },
    { id: 3, title: 'Meeting met stakeholders voorbereiden', completed: false },
    { id: 4, title: 'Unit tests schrijven voor nieuwe features', completed: false },
    { id: 5, title: 'Deployment pipeline configureren', completed: false }
];

// In-memory database
let tasks = JSON.parse(JSON.stringify(initialTasks));
let nextId = 6;

// Reset endpoint voor testen
app.post('/api/reset', (req, res) => {
    tasks = JSON.parse(JSON.stringify(initialTasks));
    nextId = 6;
    res.json({ message: 'Database gereset' });
});

// GET alle taken
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// GET één taak
app.get('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
        return res.status(404).json({ error: 'Taak niet gevonden' });
    }
    
    res.json(task);
});

// POST nieuwe taak
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Titel is verplicht' });
    }
    
    const newTask = {
        id: nextId++,
        title: title.trim(),
        completed: false
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT taak updaten
app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Taak niet gevonden' });
    }
    
    if (title !== undefined) {
        tasks[taskIndex].title = title.trim();
    }
    
    if (completed !== undefined) {
        tasks[taskIndex].completed = completed;
    }
    
    res.json(tasks[taskIndex]);
});

// PATCH taak status toggler
app.patch('/api/tasks/:id/toggle', (req, res) => {
    const id = parseInt(req.params.id);
    
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
        return res.status(404).json({ error: 'Taak niet gevonden' });
    }
    
    task.completed = !task.completed;
    res.json(task);
});

// DELETE taak verwijderen
app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Taak niet gevonden' });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.json(deletedTask);
});

// Start server
app.listen(PORT, () => {
    console.log(`TaskForce API draait op http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/tasks        - Alle taken ophalen`);
    console.log(`  GET    /api/tasks/:id    - Één taak ophalen`);
    console.log(`  POST   /api/tasks        - Nieuwe taak aanmaken`);
    console.log(`  PUT    /api/tasks/:id    - Taak updaten`);
    console.log(`  PATCH  /api/tasks/:id/toggle - Taak status toggle`);
    console.log(`  DELETE /api/tasks/:id    - Taak verwijderen`);
});
