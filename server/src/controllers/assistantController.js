const responses = {
  en: {
    greetings: [
      "Hello! I'm your Smart Travel Assistant. How can I help you plan your perfect trip?",
      "Welcome! I can help you discover hidden gems, check weather, and create personalized itineraries."
    ],
    weather: "The weather forecast shows {description} with temperatures around {temp}°C. Don't forget to pack accordingly!",
    sustainability: "Great choice! This destination has a sustainability score of {score}/100. You're helping support eco-friendly tourism.",
    crowd: "Crowd levels are {level} right now. Perfect time to visit without the rush!",
    hiddenGems: "I found some amazing hidden gems for you! These local favorites offer authentic experiences away from tourist crowds.",
    default: "I'd be happy to help! You can ask me about weather, attractions, local events, or sustainability tips for your destination."
  },
  es: {
    greetings: [
      "¡Hola! Soy tu Asistente de Viajes Inteligente. ¿Cómo puedo ayudarte a planificar tu viaje perfecto?",
      "¡Bienvenido! Puedo ayudarte a descubrir joyas ocultas, consultar el clima y crear itinerarios personalizados."
    ],
    weather: "El pronóstico del tiempo muestra {description} con temperaturas alrededor de {temp}°C. ¡No olvides empacar adecuadamente!",
    sustainability: "¡Excelente elección! Este destino tiene una puntuación de sostenibilidad de {score}/100. Estás ayudando a apoyar el turismo ecológico.",
    crowd: "Los niveles de multitudes son {level} ahora mismo. ¡Momento perfecto para visitar sin prisas!",
    hiddenGems: "¡Encontré algunas joyas ocultas increíbles para ti! Estos favoritos locales ofrecen experiencias auténticas lejos de las multitudes turísticas.",
    default: "¡Con gusto te ayudo! Puedes preguntarme sobre el clima, atracciones, eventos locales o consejos de sostenibilidad para tu destino."
  },
  fr: {
    greetings: [
      "Bonjour! Je suis votre Assistant de Voyage Intelligent. Comment puis-je vous aider à planifier votre voyage parfait?",
      "Bienvenue! Je peux vous aider à découvrir des trésors cachés, vérifier la météo et créer des itinéraires personnalisés."
    ],
    weather: "Les prévisions météo montrent {description} avec des températures autour de {temp}°C. N'oubliez pas de bien faire vos bagages!",
    sustainability: "Excellent choix! Cette destination a un score de durabilité de {score}/100. Vous contribuez à soutenir le tourisme écologique.",
    crowd: "Les niveaux de foule sont {level} en ce moment. Moment parfait pour visiter sans précipitation!",
    hiddenGems: "J'ai trouvé des trésors cachés incroyables pour vous! Ces favoris locaux offrent des expériences authentiques loin des foules touristiques.",
    default: "Je serais ravi de vous aider! Vous pouvez me demander des informations sur la météo, les attractions, les événements locaux ou les conseils de durabilité pour votre destination."
  },
  de: {
    greetings: [
      "Hallo! Ich bin Ihr Intelligenter Reiseassistent. Wie kann ich Ihnen bei der Planung Ihrer perfekten Reise helfen?",
      "Willkommen! Ich kann Ihnen helfen, versteckte Schätze zu entdecken, das Wetter zu überprüfen und personalisierte Reiserouten zu erstellen."
    ],
    weather: "Die Wettervorhersage zeigt {description} mit Temperaturen um {temp}°C. Vergessen Sie nicht, entsprechend zu packen!",
    sustainability: "Gute Wahl! Dieses Ziel hat einen Nachhaltigkeitswert von {score}/100. Sie helfen, umweltfreundlichen Tourismus zu unterstützen.",
    crowd: "Die Besucherzahlen sind gerade {level}. Perfekte Zeit für einen Besuch ohne Hektik!",
    hiddenGems: "Ich habe einige erstaunliche versteckte Schätze für Sie gefunden! Diese lokalen Favoriten bieten authentische Erlebnisse abseits der Touristenmassen.",
    default: "Ich helfe Ihnen gerne! Sie können mich nach dem Wetter, Sehenswürdigkeiten, lokalen Veranstaltungen oder Nachhaltigkeitstipps für Ihr Reiseziel fragen."
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, language = 'en', context = {} } = req.body;
    const lang = responses[language] ? language : 'en';
    const langResponses = responses[lang];

    let response = langResponses.default;
    let type = 'default';

    const lowerMessage = message.toLowerCase();

    // Simple intent detection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hola') || lowerMessage.includes('bonjour')) {
      response = langResponses.greetings[Math.floor(Math.random() * langResponses.greetings.length)];
      type = 'greeting';
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('clima') || lowerMessage.includes('météo') || lowerMessage.includes('wetter')) {
      response = langResponses.weather
        .replace('{description}', context.weather?.description || 'pleasant')
        .replace('{temp}', context.weather?.temperature || '20');
      type = 'weather';
    } else if (lowerMessage.includes('sustainability') || lowerMessage.includes('eco') || lowerMessage.includes('green')) {
      response = langResponses.sustainability.replace('{score}', context.sustainabilityScore || '75');
      type = 'sustainability';
    } else if (lowerMessage.includes('crowd') || lowerMessage.includes('busy') || lowerMessage.includes('people')) {
      response = langResponses.crowd.replace('{level}', context.crowdLevel || 'low');
      type = 'crowd';
    } else if (lowerMessage.includes('hidden') || lowerMessage.includes('secret') || lowerMessage.includes('local') || lowerMessage.includes('gem')) {
      response = langResponses.hiddenGems;
      type = 'hiddenGems';
    }

    res.json({
      response,
      type,
      language: lang
    });
  } catch (error) {
    res.status(500).json({ message: 'Assistant error', error: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { language = 'en', destination } = req.query;
    
    const suggestions = {
      en: [
        `What\'s the weather like in ${destination}?`,
        "Show me hidden gems",
        "Tell me about sustainability",
        "What are the crowd levels?"
      ],
      es: [
        `¿Cómo está el clima en ${destination}?`,
        "Muéstrame joyas ocultas",
        "Cuéntame sobre sostenibilidad",
        "¿Cuáles son los niveles de multitudes?"
      ],
      fr: [
        `Quel temps fait-il à ${destination}?`,
        "Montrez-moi des trésors cachés",
        "Parlez-moi de durabilité",
        "Quels sont les niveaux de foule?"
      ],
      de: [
        `Wie ist das Wetter in ${destination}?`,
        "Zeigen Sie mir versteckte Schätze",
        "Erzählen Sie mir von Nachhaltigkeit",
        "Wie hoch sind die Besucherzahlen?"
      ]
    };

    const lang = suggestions[language] ? language : 'en';
    
    res.json({ suggestions: suggestions[lang] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get suggestions', error: error.message });
  }
};
