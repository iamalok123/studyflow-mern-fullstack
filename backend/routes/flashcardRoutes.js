import express from 'express';
import { param } from 'express-validator';
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
} from '../controllers/flashcardController.js';
import protect from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

router.use(protect);

const documentIdValidation = [
    param('documentId').isMongoId().withMessage('Invalid document id'),
];

const cardIdValidation = [
    param('cardId').isMongoId().withMessage('Invalid card id'),
];

router.get('/', getAllFlashcardSets);
router.get('/:documentId', documentIdValidation, validateRequest, getFlashcards);
router.post('/:cardId/review', cardIdValidation, validateRequest, reviewFlashcard);
router.put('/:cardId/star', cardIdValidation, validateRequest, toggleStarFlashcard);
router.delete('/:cardId', cardIdValidation, validateRequest, deleteFlashcardSet);

export default router;
