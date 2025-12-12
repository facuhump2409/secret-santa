const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Get all participants with their gifts and clues
app.get('/api/participants', (req, res) => {
  // Get all participants
  db.all('SELECT id, name FROM participants ORDER BY name', [], (err, participants) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let completed = 0;
    const results = participants.map(p => ({ ...p, gifts: [], clues: [] }));

    if (participants.length === 0) {
      return res.json([]);
    }

    participants.forEach((participant, index) => {
      // Get gifts for this participant
      db.all('SELECT id, gift_description, gift_link FROM gifts WHERE participant_id = ?', 
        [participant.id], 
        (err, gifts) => {
          if (!err) {
            results[index].gifts = gifts.map(g => ({ 
              id: g.id, 
              description: g.gift_description,
              link: g.gift_link 
            }));
          }

          // Get clues for this participant
          db.all('SELECT id, clue_text FROM clues WHERE participant_id = ?', 
            [participant.id], 
            (err, clues) => {
              if (!err) {
                results[index].clues = clues.map(c => ({ 
                  id: c.id, 
                  text: c.clue_text 
                }));
              }

              completed++;
              if (completed === participants.length) {
                res.json(results);
              }
            }
          );
        }
      );
    });
  });
});

// Add a gift to a participant's wishlist
app.post('/api/participants/:id/gifts', (req, res) => {
  const { id } = req.params;
  const { description, link } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'La descripción del regalo es requerida' });
  }

  db.run(
    'INSERT INTO gifts (participant_id, gift_description, gift_link) VALUES (?, ?, ?)',
    [id, description, link || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, participant_id: id, description, link });
    }
  );
});

// Update a gift
app.put('/api/gifts/:id', (req, res) => {
  const { id } = req.params;
  const { description, link } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'La descripción del regalo es requerida' });
  }

  db.run(
    'UPDATE gifts SET gift_description = ?, gift_link = ? WHERE id = ?',
    [description, link || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Regalo no encontrado' });
      }
      res.json({ id, description, link });
    }
  );
});

// Delete a gift
app.delete('/api/gifts/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gift not found' });
    }
      res.json({ message: 'Regalo eliminado exitosamente' });
  });
});

// Add a clue for a participant
app.post('/api/participants/:id/clues', (req, res) => {
  const { id } = req.params;
  const { clue } = req.body;

  if (!clue) {
    return res.status(400).json({ error: 'El texto de la pista es requerido' });
  }

  db.run(
    'INSERT INTO clues (participant_id, clue_text) VALUES (?, ?)',
    [id, clue],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, participant_id: id, clue });
    }
  );
});

// Delete a clue
app.delete('/api/clues/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM clues WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Pista no encontrada' });
      }
      res.json({ message: 'Pista eliminada exitosamente' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor de Amigo Invisible corriendo en http://localhost:${PORT}`);
});
