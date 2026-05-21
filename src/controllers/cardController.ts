import type { Request, Response } from "express";
import { CardModel } from "../models/cardModel.js";
import { calculateNextReview } from "../services/sm2.js";

export const cardController = {
  // --- DECKS ---
  createDeck: (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Deck name is required" });

    try {
      const result = CardModel.createDeck(name);
      res.status(201).json({ id: Number(result.lastInsertRowid), name });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "Deck name already exists" });
      }
      res.status(500).json({ error: "Failed to create deck" });
    }
  },

  getAllDecks: (req: Request, res: Response) => {
    const decks = CardModel.getAllDecks();
    res.json(decks);
  },

  // --- CARDS ---
  createCard: (req: Request, res: Response) => {
    const { deck_id, front, back } = req.body;
    if (!deck_id || !front || !back) {
      return res
        .status(400)
        .json({ error: "deck_id, front, and back are required" });
    }

    const deck = CardModel.getDeckById(Number(deck_id));
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const result = CardModel.createCard(Number(deck_id), front, back);
    res
      .status(201)
      .json({ id: Number(result.lastInsertRowid), deck_id, front, back });
  },

  getDueCards: (req: Request, res: Response) => {
    const deckId = Number(req.params.deckId);
    if (!CardModel.getDeckById(deckId)) {
      return res.status(404).json({ error: "Deck not found" });
    }

    const cards = CardModel.getDueCards(deckId);
    res.json({ count: cards.length, cards });
  },

  reviewCard: (req: Request, res: Response) => {
    const cardId = Number(req.params.id);
    const { quality } = req.body; // 0 to 5

    if (quality === undefined || quality < 0 || quality > 5) {
      return res
        .status(400)
        .json({ error: "Quality must be a number between 0 and 5" });
    }

    const card = CardModel.getCardById(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    // THE MAGIC: Run the SM-2 algorithm and update the DB
    const nextReviewData = calculateNextReview(card, Number(quality));
    CardModel.updateCardReview(cardId, nextReviewData);

    res.json({
      message: "Review saved",
      card_id: cardId,
      next_due: nextReviewData.due_date,
      interval_days: nextReviewData.interval,
    });
  },

  updateCard: (req: Request, res: Response) => {
    const cardId = Number(req.params.id);
    const { front, back } = req.body;
    if (!front || !back)
      return res.status(400).json({ error: "front and back are required" });

    const card = CardModel.getCardById(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    CardModel.updateCardText(cardId, front, back);
    res.json({ message: "Card updated", id: cardId, front, back });
  },

  deleteCard: (req: Request, res: Response) => {
    const cardId = Number(req.params.id);
    const card = CardModel.getCardById(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    CardModel.deleteCard(cardId);
    res.json({ message: "Card deleted", id: cardId });
  },
};
