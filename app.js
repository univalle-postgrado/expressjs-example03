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
  try {
    const { rows } = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      code: 1001,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});
app.get('/movies/:id', async (req, res) => {
  try {
    const { rows, rowCount } = await db.query("SELECT * FROM movies WHERE id=" + req.params.id);
    if (rowCount > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Película no encontrada' });
    }
  } catch (err) {
    res.status(500).json({
      code: 1002,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});
app.post('/movies', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const { rows } = await db.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [req.body.title, req.body.year]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({
      code: 1003,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});
app.put('/movies/:id', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const id = intval(req.params.id);
    const { title, year } = req.body;
    const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
    if (rowCount > 0) {
      const { rows } = await db.query(`UPDATE movies SET title = '${title}', year = '${year}' WHERE id = '${id}' RETURNING *`);
      res.json(rows[0]);
    } else {
      const { rows } = await db.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [title, year]);
      res.status(201).json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({
      code: 1004,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});
app.patch('/movies/:id', async (req, res) => {
  const id = intval(req.params.id);
  try {
    const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
    if (rowCount == 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

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
  } catch (err) {
    res.status(500).json({
      code: 1005,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});
app.delete('/movies/:id', async (req, res) => {
  try {
    const id = intval(req.params.id);
    const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
    if (rowCount == 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    await db.query('DELETE FROM movies WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: 1006,
      message: 'Error al eliminar la película',
      error_message: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`)
});