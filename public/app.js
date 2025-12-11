// DOM elements
const participantsContainer = document.getElementById('participants-container');
const giftModal = document.getElementById('gift-modal');
const clueModal = document.getElementById('clue-modal');
const giftInput = document.getElementById('gift-input');
const clueInput = document.getElementById('clue-input');
const addGiftBtn = document.getElementById('add-gift-btn');
const addClueBtn = document.getElementById('add-clue-btn');

// State
let participants = [];
let editingGiftId = null;

// Initialize
loadParticipants();

// Close modal functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        giftModal.style.display = 'none';
        clueModal.style.display = 'none';
        resetModals();
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === giftModal) {
        giftModal.style.display = 'none';
        resetModals();
    }
    if (e.target === clueModal) {
        clueModal.style.display = 'none';
        resetModals();
    }
});

// Load all participants
async function loadParticipants() {
    try {
        const response = await fetch('/api/participants');
        participants = await response.json();
        renderParticipants();
    } catch (error) {
        console.error('Error loading participants:', error);
        participantsContainer.innerHTML = '<p class="empty-state">Error loading participants. Please refresh the page.</p>';
    }
}

// Render participants
function renderParticipants() {
    participantsContainer.innerHTML = '';
    
    participants.forEach(participant => {
        const card = createParticipantCard(participant);
        participantsContainer.appendChild(card);
    });
}

// Create participant card
function createParticipantCard(participant) {
    const card = document.createElement('div');
    card.className = 'participant-card';
    
    card.innerHTML = `
        <div class="participant-header">
            <h2 class="participant-name">${participant.name}</h2>
        </div>
        
        <div class="gifts-section">
            <div class="section-title">
                <span>🎁 Wishlist</span>
                <button class="btn btn-primary btn-small btn-add" onclick="openAddGiftModal(${participant.id})">Add Gift</button>
            </div>
            <ul class="gift-list" id="gifts-${participant.id}">
                ${participant.gifts.length === 0 
                    ? '<li class="empty-state">No gifts yet. Add something to your wishlist!</li>'
                    : participant.gifts.map(gift => `
                        <li class="gift-item">
                            <span class="gift-text">${gift.description}</span>
                            <div>
                                <button class="btn btn-edit btn-small" onclick="editGift(${gift.id}, ${participant.id}, '${escapeHtml(gift.description)}')">Edit</button>
                                <button class="btn btn-delete btn-small" onclick="deleteGift(${gift.id})">Delete</button>
                            </div>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
        
        <div class="clues-section">
            <div class="section-title">
                <span>🔍 Secret Santa Clues</span>
                <button class="btn btn-secondary btn-small btn-add" onclick="openAddClueModal(${participant.id})">Leave Clue</button>
            </div>
            <ul class="clue-list" id="clues-${participant.id}">
                ${participant.clues.length === 0
                    ? '<li class="empty-state">No clues yet. Your Secret Santa is mysterious!</li>'
                    : participant.clues.map(clue => `
                        <li class="clue-item">
                            <span class="clue-text">${clue.text}</span>
                            <button class="btn btn-delete btn-small" onclick="deleteClue(${clue.id})">Delete</button>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
    `;
    
    return card;
}

// Helper function to escape HTML
function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Open add gift modal
function openAddGiftModal(participantId) {
    document.getElementById('modal-participant-id').value = participantId;
    giftInput.value = '';
    editingGiftId = null;
    giftModal.style.display = 'block';
    giftInput.focus();
}

// Open add clue modal
function openAddClueModal(participantId) {
    document.getElementById('clue-participant-id').value = participantId;
    clueInput.value = '';
    clueModal.style.display = 'block';
    clueInput.focus();
}

// Edit gift
function editGift(giftId, participantId, description) {
    document.getElementById('modal-participant-id').value = participantId;
    giftInput.value = description;
    editingGiftId = giftId;
    giftModal.style.display = 'block';
    giftInput.focus();
}

// Reset modals
function resetModals() {
    giftInput.value = '';
    clueInput.value = '';
    editingGiftId = null;
}

// Add or update gift
addGiftBtn.addEventListener('click', async () => {
    const participantId = document.getElementById('modal-participant-id').value;
    const description = giftInput.value.trim();
    
    if (!description) {
        alert('Please enter a gift description!');
        return;
    }
    
    try {
        if (editingGiftId) {
            // Update existing gift
            await fetch(`/api/gifts/${editingGiftId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
        } else {
            // Add new gift
            await fetch(`/api/participants/${participantId}/gifts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
        }
        
        giftModal.style.display = 'none';
        resetModals();
        await loadParticipants();
    } catch (error) {
        console.error('Error saving gift:', error);
        alert('Error saving gift. Please try again.');
    }
});

// Add clue
addClueBtn.addEventListener('click', async () => {
    const participantId = document.getElementById('clue-participant-id').value;
    const clue = clueInput.value.trim();
    
    if (!clue) {
        alert('Please enter a clue!');
        return;
    }
    
    try {
        await fetch(`/api/participants/${participantId}/clues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clue })
        });
        
        clueModal.style.display = 'none';
        resetModals();
        await loadParticipants();
    } catch (error) {
        console.error('Error adding clue:', error);
        alert('Error adding clue. Please try again.');
    }
});

// Delete gift
async function deleteGift(giftId) {
    if (!confirm('Are you sure you want to delete this gift?')) {
        return;
    }
    
    try {
        await fetch(`/api/gifts/${giftId}`, { method: 'DELETE' });
        await loadParticipants();
    } catch (error) {
        console.error('Error deleting gift:', error);
        alert('Error deleting gift. Please try again.');
    }
}

// Delete clue
async function deleteClue(clueId) {
    if (!confirm('Are you sure you want to delete this clue?')) {
        return;
    }
    
    try {
        await fetch(`/api/clues/${clueId}`, { method: 'DELETE' });
        await loadParticipants();
    } catch (error) {
        console.error('Error deleting clue:', error);
        alert('Error deleting clue. Please try again.');
    }
}

// Allow Enter key to submit in modals
giftInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addGiftBtn.click();
    }
});
