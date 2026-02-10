const aiAssistantService = require('../services/aiAssistantService');

exports.chat = async (req, res) => {
  try {
    const { message, language = 'en', context = {} } = req.body;
    
    // Use the AI assistant service for intelligent responses
    const result = await aiAssistantService.getTravelResponse(message, language, context);
    
    res.json(result);
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({ 
      message: 'Assistant error', 
      error: error.message,
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      type: 'error'
    });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { language = 'en', destination = 'your destination' } = req.query;
    
    // Use the AI assistant service for intelligent suggestions
    const suggestions = await aiAssistantService.getSuggestions(destination, language);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to get suggestions', 
      error: error.message,
      suggestions: [
        "What's the weather like there?",
        "Show me hidden gems",
        "Tell me about sustainability",
        "What are the crowd levels?"
      ]
    });
  }
};
