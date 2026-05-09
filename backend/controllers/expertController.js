const Expert = require('../models/Expert');

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
