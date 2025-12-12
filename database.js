const { createClient } = require('@supabase/supabase-js');

// Use service role key for server-side operations (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set');
  console.error('Please create a .env file with these variables. See SETUP_SUPABASE.md for instructions.');
  throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
const db = {
  // Get all participants
  async getAllParticipants() {
    const { data, error } = await supabase
      .from('participants')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get gifts for a participant
  async getGiftsByParticipantId(participantId) {
    const { data, error } = await supabase
      .from('gifts')
      .select('id, gift_description, gift_link')
      .eq('participant_id', participantId);
    
    if (error) throw error;
    return (data || []).map(g => ({
      id: g.id,
      description: g.gift_description,
      link: g.gift_link
    }));
  },

  // Get clues for a participant
  async getCluesByParticipantId(participantId) {
    const { data, error } = await supabase
      .from('clues')
      .select('id, clue_text')
      .eq('participant_id', participantId);
    
    if (error) throw error;
    return (data || []).map(c => ({
      id: c.id,
      text: c.clue_text
    }));
  },

  // Add a gift
  async addGift(participantId, description, link) {
    const { data, error } = await supabase
      .from('gifts')
      .insert({
        participant_id: participantId,
        gift_description: description,
        gift_link: link || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      participant_id: participantId,
      description: data.gift_description,
      link: data.gift_link
    };
  },

  // Update a gift
  async updateGift(giftId, description, link) {
    const { data, error } = await supabase
      .from('gifts')
      .update({
        gift_description: description,
        gift_link: link || null
      })
      .eq('id', giftId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      const notFoundError = new Error('Gift not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    return {
      id: data.id,
      description: data.gift_description,
      link: data.gift_link
    };
  },

  // Delete a gift
  async deleteGift(giftId) {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);
    
    if (error) throw error;
    return true;
  },

  // Add a clue
  async addClue(participantId, clueText) {
    const { data, error } = await supabase
      .from('clues')
      .insert({
        participant_id: participantId,
        clue_text: clueText
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      participant_id: participantId,
      clue: data.clue_text
    };
  },

  // Delete a clue
  async deleteClue(clueId) {
    const { error } = await supabase
      .from('clues')
      .delete()
      .eq('id', clueId);
    
    if (error) throw error;
    return true;
  },

  // Initialize database (seed participants if needed)
  async initialize() {
    const names = ['JuanFran', 'JuanMar', 'Karina', 'Jorge', 'Juani', 'Kazu', 
      'Abuela', 'Judit', 'Andres', 'Santiago', 'Facundo', 'Catalina', 'Lucas',
      'Iara'
    ];

    // Check if participants exist
    const { data: existingParticipants } = await supabase
      .from('participants')
      .select('name');

    const existingNames = (existingParticipants || []).map(p => p.name);
    const namesToInsert = names.filter(name => !existingNames.includes(name));

    if (namesToInsert.length > 0) {
      const { error } = await supabase
        .from('participants')
        .insert(namesToInsert.map(name => ({ name })));
      
      if (error) {
        console.error('Error seeding participants:', error);
      } else {
        console.log(`Seeded ${namesToInsert.length} participants`);
      }
    }

    console.log('Database initialized successfully!');
  }
};

// Initialize on module load
db.initialize().catch(err => {
  console.error('Error initializing database:', err);
});

module.exports = db;
