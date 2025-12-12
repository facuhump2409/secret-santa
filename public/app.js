// DOM elements
const participantsContainer = document.getElementById('participants-container');
const giftModal = document.getElementById('gift-modal');
const clueModal = document.getElementById('clue-modal');
const giftInput = document.getElementById('gift-input');
const giftLinkInput = document.getElementById('gift-link-input');
const clueInput = document.getElementById('clue-input');
const addGiftBtn = document.getElementById('add-gift-btn');
const addClueBtn = document.getElementById('add-clue-btn');

// State
let participants = [];
let editingGiftId = null;

// Initialize
loadParticipants();

// Event delegation for button clicks
participantsContainer.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    
    if (action === 'add-gift') {
        openAddGiftModal(e.target.dataset.participantId);
    } else if (action === 'edit-gift') {
        editGift(e.target.dataset.giftId, e.target.dataset.participantId, e.target.dataset.description, e.target.dataset.link);
    } else if (action === 'delete-gift') {
        deleteGift(e.target.dataset.giftId);
    } else if (action === 'add-clue') {
        openAddClueModal(e.target.dataset.participantId);
    } else if (action === 'delete-clue') {
        deleteClue(e.target.dataset.clueId);
    }
});

// Close modal functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        giftModal.style.display = 'none';
        clueModal.style.display = 'none';
        resetModals();
    });
    
    // Add keyboard support for accessibility
    closeBtn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            giftModal.style.display = 'none';
            clueModal.style.display = 'none';
            resetModals();
        }
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
        participantsContainer.innerHTML = '<p class="empty-state">Error al cargar participantes. Por favor, refrescá la página.</p>';
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
    
    // Create header
    const header = document.createElement('div');
    header.className = 'participant-header';
    header.innerHTML = `<h2 class="participant-name">${escapeHtml(participant.name)}</h2>`;
    card.appendChild(header);
    
    // Create gifts section
    const giftsSection = document.createElement('div');
    giftsSection.className = 'gifts-section';
    
    const giftsTitleDiv = document.createElement('div');
    giftsTitleDiv.className = 'section-title';
    giftsTitleDiv.innerHTML = '<span>🎁 Lista de Deseos</span>';
    
    const addGiftBtn = document.createElement('button');
    addGiftBtn.className = 'btn btn-primary btn-small btn-add';
    addGiftBtn.textContent = 'Agregar Regalo';
    addGiftBtn.dataset.action = 'add-gift';
    addGiftBtn.dataset.participantId = participant.id;
    giftsTitleDiv.appendChild(addGiftBtn);
    giftsSection.appendChild(giftsTitleDiv);
    
    const giftsList = document.createElement('ul');
    giftsList.className = 'gift-list';
    giftsList.id = `gifts-${participant.id}`;
    
    if (participant.gifts.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'Todavía no hay regalos. ¡Agregá algo a tu lista de deseos!';
        giftsList.appendChild(emptyItem);
    } else {
        participant.gifts.forEach(gift => {
            const giftItem = document.createElement('li');
            giftItem.className = 'gift-item';
            
            const giftContent = document.createElement('div');
            giftContent.className = 'gift-content';
            
            const giftText = document.createElement('span');
            giftText.className = 'gift-text';
            giftText.textContent = gift.description;
            giftContent.appendChild(giftText);
            
            // Add link if it exists
            if (gift.link) {
                const linkIcon = document.createElement('a');
                linkIcon.href = gift.link;
                linkIcon.target = '_blank';
                linkIcon.rel = 'noopener noreferrer';
                linkIcon.className = 'gift-link';
                linkIcon.innerHTML = '🔗';
                linkIcon.title = 'Ver link del regalo';
                giftContent.appendChild(linkIcon);
            }
            
            giftItem.appendChild(giftContent);
            
            const buttonsDiv = document.createElement('div');
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-edit btn-small';
            editBtn.textContent = 'Editar';
            editBtn.dataset.action = 'edit-gift';
            editBtn.dataset.giftId = gift.id;
            editBtn.dataset.participantId = participant.id;
            editBtn.dataset.description = gift.description;
            editBtn.dataset.link = gift.link || '';
            buttonsDiv.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-delete btn-small';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.dataset.action = 'delete-gift';
            deleteBtn.dataset.giftId = gift.id;
            buttonsDiv.appendChild(deleteBtn);
            
            giftItem.appendChild(buttonsDiv);
            giftsList.appendChild(giftItem);
        });
    }
    
    giftsSection.appendChild(giftsList);
    card.appendChild(giftsSection);
    
    // Create clues section
    const cluesSection = document.createElement('div');
    cluesSection.className = 'clues-section';
    
    const cluesTitleDiv = document.createElement('div');
    cluesTitleDiv.className = 'section-title';
    cluesTitleDiv.innerHTML = '<span>🔍 Pistas del Amigo Invisible</span>';
    
    const addClueBtn = document.createElement('button');
    addClueBtn.className = 'btn btn-secondary btn-small btn-add';
    addClueBtn.textContent = 'Dejar Pista';
    addClueBtn.dataset.action = 'add-clue';
    addClueBtn.dataset.participantId = participant.id;
    cluesTitleDiv.appendChild(addClueBtn);
    cluesSection.appendChild(cluesTitleDiv);
    
    const cluesList = document.createElement('ul');
    cluesList.className = 'clue-list';
    cluesList.id = `clues-${participant.id}`;
    
    if (participant.clues.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'Todavía no hay pistas. ¡Tu Amigo Invisible es misterioso!';
        cluesList.appendChild(emptyItem);
    } else {
        participant.clues.forEach(clue => {
            const clueItem = document.createElement('li');
            clueItem.className = 'clue-item';
            
            const clueText = document.createElement('span');
            clueText.className = 'clue-text';
            clueText.textContent = clue.text;
            clueItem.appendChild(clueText);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-delete btn-small';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.dataset.action = 'delete-clue';
            deleteBtn.dataset.clueId = clue.id;
            clueItem.appendChild(deleteBtn);
            
            cluesList.appendChild(clueItem);
        });
    }
    
    cluesSection.appendChild(cluesList);
    card.appendChild(cluesSection);
    
    return card;
}

// Helper function to escape HTML
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Open add gift modal
function openAddGiftModal(participantId) {
    document.getElementById('modal-participant-id').value = participantId;
    giftInput.value = '';
    giftLinkInput.value = '';
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
function editGift(giftId, participantId, description, link) {
    document.getElementById('modal-participant-id').value = participantId;
    giftInput.value = description;
    giftLinkInput.value = link || '';
    editingGiftId = giftId;
    giftModal.style.display = 'block';
    giftInput.focus();
}

// Reset modals
function resetModals() {
    giftInput.value = '';
    giftLinkInput.value = '';
    clueInput.value = '';
    editingGiftId = null;
}

// Add or update gift
addGiftBtn.addEventListener('click', async () => {
    const participantId = document.getElementById('modal-participant-id').value;
    const description = giftInput.value.trim();
    const link = giftLinkInput.value.trim();
    
    if (!description) {
        alert('¡Por favor ingresá una descripción del regalo!');
        return;
    }
    
    try {
        if (editingGiftId) {
            // Update existing gift
            await fetch(`/api/gifts/${editingGiftId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, link })
            });
        } else {
            // Add new gift
            await fetch(`/api/participants/${participantId}/gifts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, link })
            });
        }
        
        giftModal.style.display = 'none';
        resetModals();
        await loadParticipants();
    } catch (error) {
        console.error('Error saving gift:', error);
        alert('Error al guardar el regalo. Por favor intentá de nuevo.');
    }
});

// Add clue
addClueBtn.addEventListener('click', async () => {
    const participantId = document.getElementById('clue-participant-id').value;
    const clue = clueInput.value.trim();
    
    if (!clue) {
        alert('¡Por favor ingresá una pista!');
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
        alert('Error al agregar la pista. Por favor intentá de nuevo.');
    }
});

// Delete gift
async function deleteGift(giftId) {
    if (!confirm('¿Estás seguro de que querés eliminar este regalo?')) {
        return;
    }
    
    try {
        await fetch(`/api/gifts/${giftId}`, { method: 'DELETE' });
        await loadParticipants();
    } catch (error) {
        console.error('Error deleting gift:', error);
        alert('Error al eliminar el regalo. Por favor intentá de nuevo.');
    }
}

// Delete clue
async function deleteClue(clueId) {
    if (!confirm('¿Estás seguro de que querés eliminar esta pista?')) {
        return;
    }
    
    try {
        await fetch(`/api/clues/${clueId}`, { method: 'DELETE' });
        await loadParticipants();
    } catch (error) {
        console.error('Error deleting clue:', error);
        alert('Error al eliminar la pista. Por favor intentá de nuevo.');
    }
}

// Allow Enter key to submit in modals
giftInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addGiftBtn.click();
    }
});
