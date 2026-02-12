# Smart Travel Assistant

A full-stack tourism platform with AI-powered personalized itineraries, real-time travel intelligence, and sustainability-focused recommendations.

## Features

- **AI-Powered Itinerary Generator**: Creates personalized day-by-day travel plans based on interests, budget, and preferences
- **Real-Time Weather**: Live weather forecasts using Open-Meteo API
- **Local Events**: Discover events happening at your destination
- **Interactive Maps**: Visualize your itinerary with Leaflet maps
- **Sustainability Scoring**: Eco-friendly recommendations with visual sustainability scores
- **Hidden Gems**: Discover non-touristy, local favorites
- **Multilingual Assistant**: Chat with the virtual assistant in multiple languages
- **Crowd Intelligence**: Real-time crowd level indicators

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Open-Meteo API (Weather)
- PredictHQ API (Events)
- OpenStreetMap/Nominatim (Places)
- Overpass API (Crowd data)

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Framer Motion (Animations)
- Leaflet (Maps)
- Lucide React (Icons)

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

## Setup Instructions

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd Tourism_and_Travel_Tech
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Environment Setup

**Backend (.env file in /server):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-travel-assistant
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Optional: PredictHQ API Key for real events
PREDICTHQ_API_KEY=your-predicthq-api-key
```

**Frontend (.env file in /client):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
Make sure MongoDB is running locally or update MONGODB_URI to point to your MongoDB Atlas cluster.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Access the App
Open your browser and navigate to: `http://localhost:5173`

## Demo Flow

1. **Register/Login**: Create an account or sign in
2. **Plan Your Trip**: 
   - Search for a destination (e.g., "Barcelona", "Paris", "Tokyo")
   - Select your interests (Culture, Food, Nature, etc.)
   - Choose budget level and trip duration
   - Select your preferred language
3. **Generate Itinerary**: Click "Generate Smart Trip" to create your personalized plan
4. **Explore**:
   - View your day-by-day itinerary with activities
   - Check real-time weather forecasts
   - See local events happening during your trip
   - Explore the interactive map with all your stops
   - Chat with the virtual assistant for recommendations

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Itineraries
- `POST /api/itineraries/generate` - Generate new itinerary
- `GET /api/itineraries` - Get user's itineraries
- `GET /api/itineraries/:id` - Get specific itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary

### Data
- `GET /api/data/weather/:lat/:lng` - Get weather forecast
- `GET /api/data/places/search?q=query` - Search places
- `GET /api/data/places/nearby` - Get nearby attractions
- `GET /api/data/events/:lat/:lng` - Get local events

### Assistant
- `POST /api/assistant/chat` - Chat with virtual assistant
- `GET /api/assistant/suggestions` - Get suggested questions

## Project Structure

```
Tourism_and_Travel_Tech/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # External API services
│   │   └── index.js        # Entry point
│   └── package.json
└── README.md
```

## Real-Time Data Sources

- **Weather**: Open-Meteo API (Free, no API key required)
- **Places**: OpenStreetMap Nominatim (Free)
- **Attractions**: Overpass API (Free)
- **Events**: PredictHQ (Free tier available, optional)

## Notes for Hackathon Demo

- The app uses real-time data from free APIs
- Weather data updates every 15 minutes (cached)
- Places and attractions are fetched from OpenStreetMap
- Events use PredictHQ if API key is provided, otherwise generates realistic mock events
- All features are fully functional and interactive
- Responsive design works on desktop and mobile

## License

MIT

//Will I be contribute here.. Checking the process to do the project contribution work .
