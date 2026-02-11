const Hotel = require('../models/Hotel');

// Get hotels near a destination
exports.getHotels = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, lat, lng } = req.query;
    
    // Validate required parameters
    if (!destination) {
      return res.status(400).json({ 
        message: 'Destination is required' 
      });
    }
    
    // Use the Hotel model to search for hotels
    const params = {
      destination,
      checkIn,
      checkOut,
      guests: parseInt(guests) || 1,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    
    // Log for debugging
    console.log('Searching hotels for:', params);
    
    const hotels = await Hotel.search(params);

    res.json({
      hotels,
      total: hotels.length,
      filters: {
        destination,
        checkIn,
        checkOut,
        guests: parseInt(guests) || 1
      }
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({ 
      message: 'Failed to search hotels',
      error: error.message 
    });
  }
};

// Get hotel details
exports.getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock hotel details
    const hotel = {
      id,
      name: 'Grand Plaza Hotel',
      location: 'Downtown Area',
      rating: 4.8,
      price: 189,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop'
      ],
      amenities: ['wifi', 'parking', 'pool', 'spa', 'restaurant', 'gym'],
      distanceFromCenter: '0.2 km',
      description: 'Luxury hotel with stunning city views and premium amenities. Perfect for business travelers and tourists alike.',
      reviews: [
        { user: 'John D.', rating: 5, comment: 'Amazing experience!' },
        { user: 'Sarah M.', rating: 4, comment: 'Great location and service.' }
      ],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation until 24 hours before arrival'
      }
    };

    res.json(hotel);
  } catch (error) {
    console.error('Hotel details error:', error);
    res.status(500).json({ 
      message: 'Failed to get hotel details',
      error: error.message 
    });
  }
};

// Book a hotel room
exports.bookHotel = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms, userId } = req.body;
    
    // In a real implementation, this would process the booking
    // For now, we'll return a mock booking confirmation
    
    const booking = {
      bookingId: `BK${Date.now()}`,
      hotelId,
      checkIn,
      checkOut,
      guests: parseInt(guests) || 1,
      rooms: parseInt(rooms) || 1,
      totalAmount: 189 * 3, // Assuming 3 nights for example
      status: 'confirmed',
      confirmationNumber: `CONF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      bookingDate: new Date().toISOString()
    };

    // Here you would save the booking to the database
    // await Booking.create(booking);

    res.json({
      message: 'Hotel booked successfully!',
      booking,
      hotel: {
        name: 'Grand Plaza Hotel',
        location: 'Downtown Area',
        checkIn,
        checkOut
      }
    });
  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({ 
      message: 'Failed to book hotel',
      error: error.message 
    });
  }
};

// Get user's hotel bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    
    // Mock user bookings
    const bookings = [
      {
        bookingId: 'BK123456789',
        hotelName: 'Grand Plaza Hotel',
        location: 'Downtown Area',
        checkIn: '2023-12-15',
        checkOut: '2023-12-18',
        totalAmount: 567,
        status: 'confirmed',
        confirmationNumber: 'CONFABC123'
      },
      {
        bookingId: 'BK987654321',
        hotelName: 'Boutique Garden Inn',
        location: 'Garden District',
        checkIn: '2023-11-20',
        checkOut: '2023-11-22',
        totalAmount: 258,
        status: 'completed',
        confirmationNumber: 'CONFXZY987'
      }
    ];

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      message: 'Failed to get bookings',
      error: error.message 
    });
  }
};