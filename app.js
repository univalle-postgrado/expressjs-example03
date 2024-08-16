const express = require('express');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(express.json());

const db = new Client({
  user: 'univalle',
  host: 'localhost',
  database: 'univalle_dbmovies',
  password: '123456',
  port: 5432
});
db.connect();

const validateMovie = [
  body('title').notEmpty().withMessage('El título es requerido'),
];

app.get('/', (req, res) => {
  res.send('Hola Mundo!');
});

app.get('/movies', async (req, res) => {
  const { rows } = await db.query("SELECT * FROM movies");
  res.json(rows);
});
app.get('/movies/:id', async (req, res) => {
  const { rows, rowCount } = await db.query("SELECT * FROM movies WHERE id=" + req.params.id);
  if (rowCount > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ message: 'Película no encontrada' });
  }
});
app.post('/movies', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { rows } = await db.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [req.body.title, req.body.year]);
  res.status(201).json(rows[0]);
});
app.put('/movies/:id', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { title, year } = req.body;
  const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${req.params.id}`);
  if (rowCount > 0) {
    const { rows } = await db.query(`UPDATE movies SET title = '${title}', year = '${year}' WHERE id = '${req.params.id}' RETURNING *`);
    res.json(rows[0]);
  } else {
    const { rows } = await db.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [req.body.title, req.body.year]);
    res.status(201).json(rows[0]);
  }
});
app.patch('/movies/:id', async (req, res) => {
  const id = req.params.id;
  const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
  if (rowCount == 0) {
    res.status(404).json({ message: 'Película no encontrada' });
  } else {
    const { title, year } = req.body;
    let updateQuery = 'UPDATE movies SET ';
    let updateValues = [];

    let i = 1;
    if (title) {
      updateQuery += `title = $${i}, `;
      updateValues.push(title);
      i++;
    }

    if (year) {
      updateQuery += `year = $${i}, `;
      updateValues.push(year);
      i++;
    }

    updateQuery = updateQuery.slice(0, -2); // Quitar la coma final
    updateQuery += ' WHERE id = $' + i + ' RETURNING *';
    updateValues.push(id); 

    const { rows } = await db.query(updateQuery, updateValues);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'No se pudo actualizar la película' })
    }
  }
});
app.delete('/movies/:id', async (req, res) => {
  const id = req.params.id;
  const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
  if (rowCount == 0) {
    res.status(404).json({ message: 'Película no encontrada' });
  } else {
    await db.query('DELETE FROM movies WHERE id = $1', [id]);
    res.sendStatus(204);
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`)
});