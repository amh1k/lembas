// src/models/cardModel.ts
import db from "../config/db.js";
import type { Card, Deck, ReviewResult } from "../types.js"; // Adjust path

const stmts = {
  createDeck: db.prepare("INSERT INTO decks (name) VALUES (?)"),
  getAllDecks: db.prepare("SELECT * FROM decks"),
  getDeckById: db.prepare("SELECT * FROM decks WHERE id = ?"),
  deleteDeck: db.prepare("DELETE FROM decks WHERE id = ?"),

  createCard: db.prepare(
    "INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)",
  ),
  getCardById: db.prepare("SELECT * FROM cards WHERE id = ?"),
  getCardsByDeck: db.prepare("SELECT * FROM cards WHERE deck_id = ?"),
  updateCardText: db.prepare(
    "UPDATE cards SET front = ?, back = ? WHERE id = ?",
  ),
  deleteCard: db.prepare("DELETE FROM cards WHERE id = ?"),

  getDueCards: db.prepare(`
        SELECT * FROM cards
        WHERE deck_id = ? AND due_date <= datetime('now')
        ORDER BY due_date ASC
    `),

  updateCardReview: db.prepare(`
        UPDATE cards
        SET easiness_factor = ?, interval = ?, repetitions = ?, due_date = ?
        WHERE id = ?
    `),
};

export const CardModel = {
  // --- DECKS ---
  createDeck: (name: string) => stmts.createDeck.run(name),
  getAllDecks: (): Deck[] => stmts.getAllDecks.all() as Deck[],
  getDeckById: (id: number): Deck | undefined =>
    stmts.getDeckById.get(id) as Deck | undefined,
  deleteDeck: (id: number) => stmts.deleteDeck.run(id),

  // --- CARDS ---
  createCard: (deck_id: number, front: string, back: string) =>
    stmts.createCard.run(deck_id, front, back),

  getCardById: (id: number): Card | undefined =>
    stmts.getCardById.get(id) as Card | undefined,

  getCardsByDeck: (deck_id: number): Card[] =>
    stmts.getCardsByDeck.all(deck_id) as Card[],

  updateCardText: (id: number, front: string, back: string) =>
    stmts.updateCardText.run(front, back, id),

  deleteCard: (id: number) => stmts.deleteCard.run(id),

  // --- SRS LOGIC ---
  getDueCards: (deck_id: number): Card[] =>
    stmts.getDueCards.all(deck_id) as Card[],

  updateCardReview: (id: number, result: ReviewResult) =>
    stmts.updateCardReview.run(
      result.easiness_factor,
      result.interval,
      result.repetitions,
      result.due_date,
      id,
    ),
};
