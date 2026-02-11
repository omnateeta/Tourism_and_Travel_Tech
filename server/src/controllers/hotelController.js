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
    
    // Use the Hotel model to get real hotel details
    const hotel = await Hotel.findById(id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
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