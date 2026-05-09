const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { expertId, userName, userEmail, userPhone, date, timeSlot, notes } = req.body;

    // Atomic update — prevents race conditions without transactions
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'timeSlots.date': date,
        'timeSlots.time': timeSlot,
        'timeSlots.isBooked': false,
      },
      { $set: { 'timeSlots.$.isBooked': true } },
      { new: true }
    );

    if (!expert) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another.',
      });
    }

    const booking = new Booking({
      expert: expertId,
      expertName: expert.name,
      userName,
      userEmail,
      userPhone,
      date,
      timeSlot,
      notes,
      status: 'Pending',
    });

    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', {
        expertId,
        date,
        timeSlot,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: booking,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another.',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings?email=
exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const bookings = await Booking.find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .populate('expert', 'name category avatar');

    res.json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // If cancelled, free up the slot so others can book it
    if (status === 'Cancelled') {
      await Expert.updateOne(
        {
          _id: booking.expert,
          'timeSlots.date': booking.date,
          'timeSlots.time': booking.timeSlot,
        },
        { $set: { 'timeSlots.$.isBooked': false } }
      );

      const io = req.app.get('io');
      if (io) {
        io.to(`expert-${booking.expert}`).emit('slot-freed', {
          expertId: booking.expert,
          date: booking.date,
          timeSlot: booking.timeSlot,
        });
      }
    }

    res.json({ success: true, data: booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};