const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, d.specialty, d.experience, d.languages, d.price, d.rating FROM users u JOIN doctors d ON d.user_id=u.id ORDER BY u.created_at DESC`);
    const doctors = (rows || []).map(d => ({ id: String(d.id), role: 'doctor', name: d.name, email: d.email, specialty: d.specialty, experience: d.experience, rating: Number(d.rating), price: Number(d.price), languages: d.languages ? JSON.parse(d.languages) : [], slots: [] }));
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


