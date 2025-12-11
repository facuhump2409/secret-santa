const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Get all participants with their gifts and clues
app.get('/api/participants', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      GROUP_CONCAT(DISTINCT g.id || ':' || g.gift_description) as gifts,
      GROUP_CONCAT(DISTINCT c.id || ':' || c.clue_text) as clues
    FROM participants p
    LEFT JOIN gifts g ON p.id = g.participant_id
    LEFT JOIN clues c ON p.id = c.participant_id
    GROUP BY p.id
    ORDER BY p.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse the concatenated gifts and clues
    const participants = rows.map(row => ({
      id: row.id,
      name: row.name,
      gifts: row.gifts ? row.gifts.split(',').map(g => {
        const [id, ...desc] = g.split(':');
        return { id: parseInt(id), description: desc.join(':') };
      }) : [],
      clues: row.clues ? row.clues.split(',').map(c => {
        const [id, ...text] = c.split(':');
        return { id: parseInt(id), text: text.join(':') };
      }) : []
    }));
    
    res.json(participants);
  });
});

// Add a gift to a participant's wishlist
app.post('/api/participants/:id/gifts', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Gift description is required' });
  }

  db.run(
    'INSERT INTO gifts (participant_id, gift_description) VALUES (?, ?)',
    [id, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, participant_id: id, description });
    }
  );
});

// Update a gift
app.put('/api/gifts/:id', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Gift description is required' });
  }

  db.run(
    'UPDATE gifts SET gift_description = ? WHERE id = ?',
    [description, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Gift not found' });
      }
      res.json({ id, description });
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
    res.json({ message: 'Gift deleted successfully' });
  });
});

// Add a clue for a participant
app.post('/api/participants/:id/clues', (req, res) => {
  const { id } = req.params;
  const { clue } = req.body;

  if (!clue) {
    return res.status(400).json({ error: 'Clue text is required' });
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
      return res.status(404).json({ error: 'Clue not found' });
    }
    res.json({ message: 'Clue deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Secret Santa server running on http://localhost:${PORT}`);
});
