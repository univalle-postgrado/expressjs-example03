const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

let movies = [
    { id: '619971fa-a379-4736-a69e-8fa8091376e7', title: 'El Padrino', year: 1980 },
    { id: 'd9f2aa8a-1e88-4986-939a-09d8e4ce9767', title: 'El Señor de los Anillos', year: 2002 }
];

app.use(express.json());

const validateMovie = [
    body('title').notEmpty().withMessage('El título es requerido'),
];

app.get('/', (req, res) => {
  res.send('Hola Mundo!');
});

app.get('/movies', (req, res) => {
  res.json(movies);
});
app.get('/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Película no encontrada' });
  }
});
app.post('/movies', validateMovie, (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    const newMovie = {
        ...req.body,
        id: uuidv4()
    }
    movies.push(newMovie);
    res.status(201).json(newMovie);
});
app.put('/movies/:id', validateMovie, (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
        
    const id = req.params.id;
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        movies[movieIndex] = { ...req.body, id };
        res.json(movies[movieIndex]);
    } else {
        const newMovie = {
            ...req.body,
            id: id
        }
        lastId = id;
        movies.push(newMovie);
        res.status(201).json(newMovie);
    }
});
app.patch('/movies/:id', (req, res) => {
    const id = req.params.id;
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        Object.assign(movies[movieIndex], req.body);
        res.json(movies[movieIndex]);
    } else {
        res.status(404).json({ message: 'Película no encontrada' })
    }
});
app.delete('/movies/:id', (req, res) => {
    const id = req.params.id;
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        movies.splice(movieIndex, 1);
        res.sendStatus(204);
    } else {
        res.status(404).json({ message: 'Película no encontrada' })
    }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`)
});