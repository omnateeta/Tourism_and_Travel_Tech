const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');

router.post('/chat', assistantController.chat);
router.get('/suggestions', assistantController.getSuggestions);

module.exports = router;
