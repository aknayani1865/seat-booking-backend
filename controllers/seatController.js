const Seat = require('../models/seatModel');

// Initialize the seats in the database
const initializeSeats = async (req, res) => {
  try {
    // Only initialize if there are no seats
    const seatCount = await Seat.countDocuments();
    if (seatCount === 0) {
      let seats = [];
      for (let i = 1; i <= 80; i++) {
        seats.push({ seatNumber: i });
      }
      await Seat.insertMany(seats);
      return res.status(201).json({ message: 'Seats initialized' });
    }
    res.status(200).json({ message: 'Seats already initialized' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all seats
const getSeats = async (req, res) => {
  try {
    const seats = await Seat.find();
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reserve seats
const reserveSeats = async (req, res) => {
    const { numberOfSeats } = req.body;
  
    if (numberOfSeats < 1 || numberOfSeats > 7) {
      return res.status(400).json({ message: 'You can only reserve 1 to 7 seats at a time.' });
    }
  
    try {
      // Fetch unbooked seats from the database
      const unbookedSeats = await Seat.find({ isBooked: false }).sort('seatNumber');
  
       // Check if there are enough unbooked seats available
    if (unbookedSeats.length === 0) {
        return res.status(400).json({ message: 'All seats are already booked.' });
      }
      
      // Check if there are enough seats available
      if (unbookedSeats.length < numberOfSeats) {
        return res.status(400).json({ message: 'Not enough seats available.' });
      }
  
      // Group unbooked seats by row (7 seats in each row, last row has 3)
      const rows = {};
      unbookedSeats.forEach(seat => {
        const row = Math.floor((seat.seatNumber - 1) / 7); // Calculate the row number
        if (!rows[row]) {
          rows[row] = [];
        }
        rows[row].push(seat);
      });
  
      let bookedSeats = [];
  
      // Try to find seats in the same row first
      for (let row in rows) {
        if (rows[row].length >= numberOfSeats) {
          // Book seats from this row
          const seatsToBook = rows[row].slice(0, numberOfSeats);
          for (let seat of seatsToBook) {
            seat.isBooked = true;
            await seat.save();
            bookedSeats.push(seat.seatNumber);
          }
          return res.status(200).json({ bookedSeats });
        }
      }
  
      // If no single row has enough seats, find nearby seats across multiple rows
      for (let row in rows) {
        for (let seat of rows[row]) {
          if (bookedSeats.length < numberOfSeats) {
            seat.isBooked = true;
            await seat.save();
            bookedSeats.push(seat.seatNumber);
          }
        }
      }
  
      res.status(200).json({ bookedSeats });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

module.exports = { initializeSeats, getSeats, reserveSeats };
