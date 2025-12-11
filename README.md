# 🎅 Secret Santa Gift Exchange

A festive web application for managing Secret Santa gift exchanges! Participants can create and manage their wishlists, and Secret Santas can leave mysterious clues about their identity.

## Features

- 🎁 **Wishlist Management**: Participants can add, edit, and delete gifts they want to receive
- 🔍 **Secret Santa Clues**: Secret Santas can leave clues about their identity
- 🎄 **Christmas Theme**: Beautiful red, green, and white color scheme
- 💾 **Persistent Storage**: All data is stored in a SQLite database
- 👥 **Multiple Participants**: Pre-loaded with 5 participants (Emma Wilson, James Anderson, Sophia Martinez, Oliver Johnson, Isabella Brown)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Start managing wishlists and leaving clues!

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with Christmas colors

## Database Schema

### Tables

1. **participants**: Stores participant information
   - id (PRIMARY KEY)
   - name

2. **gifts**: Stores wishlist items
   - id (PRIMARY KEY)
   - participant_id (FOREIGN KEY)
   - gift_description

3. **clues**: Stores Secret Santa clues
   - id (PRIMARY KEY)
   - participant_id (FOREIGN KEY)
   - clue_text
   - created_at

## API Endpoints

- `GET /api/participants` - Get all participants with their gifts and clues
- `POST /api/participants/:id/gifts` - Add a gift to a participant's wishlist
- `PUT /api/gifts/:id` - Update a gift
- `DELETE /api/gifts/:id` - Delete a gift
- `POST /api/participants/:id/clues` - Add a clue for a participant
- `DELETE /api/clues/:id` - Delete a clue

## License

ISC