const Expert = require('../models/Expert');

const generateFutureSlots = () => {
  const slots = [];
  const today = new Date();
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  for (let d = 1; d <= 14; d += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    times.forEach((time) => slots.push({ date: dateStr, time, isBooked: false }));
  }

  return slots;
};

// GET /api/experts
exports.getExperts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 8 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .select('-timeSlots')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/experts/:id
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    // Group timeslots by date, only show future slots
    const today = new Date().toISOString().split('T')[0];
    if (!expert.timeSlots.some((slot) => slot.date >= today)) {
      expert.timeSlots = generateFutureSlots();
      await expert.save();
    }

    const groupedSlots = {};

    expert.timeSlots
      .filter((slot) => slot.date >= today)
      .forEach((slot) => {
        if (!groupedSlots[slot.date]) groupedSlots[slot.date] = [];
        groupedSlots[slot.date].push({
          _id: slot._id,
          time: slot.time,
          isBooked: slot.isBooked,
        });
      });

    // Sort slots by time within each date
    Object.keys(groupedSlots).forEach((date) => {
      groupedSlots[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    const expertData = expert.toObject();
    delete expertData.timeSlots;

    res.json({
      success: true,
      data: {
        ...expertData,
        availableSlots: groupedSlots,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
