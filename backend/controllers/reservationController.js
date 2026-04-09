const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const getReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.user = req.user._id;
    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .populate('table', 'tableNumber capacity')
      .sort({ date: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const { tableId, date, timeSlot, partySize, specialRequests } = req.body;

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.capacity < partySize) return res.status(400).json({ message: 'Table capacity insufficient' });

    const reservationDate = new Date(date);
    const conflicting = await Reservation.findOne({
      table: tableId,
      date: { $gte: new Date(reservationDate.setHours(0, 0, 0, 0)), $lt: new Date(reservationDate.setHours(23, 59, 59, 999)) },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflicting) return res.status(400).json({ message: 'Table already reserved for this time slot' });

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      timeSlot,
      partySize,
      specialRequests,
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email')
      .populate('table', 'tableNumber');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (req.user.role === 'user' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date, tableId } = req.query;
    const allSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
    if (!date) return res.json(allSlots);

    const reservationDate = new Date(date);
    const query = {
      date: { $gte: new Date(reservationDate.setHours(0, 0, 0, 0)), $lt: new Date(reservationDate.setHours(23, 59, 59, 999)) },
      status: { $in: ['pending', 'confirmed'] },
    };
    if (tableId) query.table = tableId;

    const existing = await Reservation.find(query).select('timeSlot');
    const bookedSlots = existing.map(r => r.timeSlot);
    const available = allSlots.filter(s => !bookedSlots.includes(s));
    res.json(available);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReservations, createReservation, updateReservation, cancelReservation, getAvailableSlots };
