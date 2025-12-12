// Load environment variables from .env file
require('dotenv').config();

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
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await db.getAllParticipants();
    
    if (participants.length === 0) {
      return res.json([]);
    }

    // Get gifts and clues for each participant
    const results = await Promise.all(
      participants.map(async (participant) => {
        const [gifts, clues] = await Promise.all([
          db.getGiftsByParticipantId(participant.id),
          db.getCluesByParticipantId(participant.id)
        ]);

        return {
          ...participant,
          gifts,
          clues
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error loading participants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a gift to a participant's wishlist
app.post('/api/participants/:id/gifts', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, link } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'La descripción del regalo es requerida' });
    }

    const gift = await db.addGift(id, description, link);
    res.json(gift);
  } catch (error) {
    console.error('Error adding gift:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a gift
app.put('/api/gifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, link } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'La descripción del regalo es requerida' });
    }

    const gift = await db.updateGift(id, description, link);
    res.json(gift);
  } catch (error) {
    console.error('Error updating gift:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a gift
app.delete('/api/gifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteGift(id);
    res.json({ message: 'Regalo eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting gift:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a clue for a participant
app.post('/api/participants/:id/clues', async (req, res) => {
  try {
    const { id } = req.params;
    const { clue } = req.body;

    if (!clue) {
      return res.status(400).json({ error: 'El texto de la pista es requerido' });
    }

    const result = await db.addClue(id, clue);
    res.json(result);
  } catch (error) {
    console.error('Error adding clue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a clue
app.delete('/api/clues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteClue(id);
    res.json({ message: 'Pista eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting clue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export app for Vercel serverless functions
module.exports = app;

// Start server for local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de Amigo Invisible corriendo en http://localhost:${PORT}`);
  });
}
