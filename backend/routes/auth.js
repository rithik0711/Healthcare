const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.post('/register-doctor', async (req, res) => {
  try {
    const { name, email, password, specialty, experience, price, languages = [], rating = 4.5 } = req.body;
    if (!name || !email || !password || !specialty || typeof experience === 'undefined' || typeof price === 'undefined') {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [userResult] = await conn.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, passwordHash, 'doctor']);
      const userId = userResult.insertId;
      await conn.query('INSERT INTO doctors (user_id, specialty, experience, languages, price, rating) VALUES (?,?,?,?,?,?)', [userId, specialty, Number(experience), JSON.stringify(languages), Number(price), Number(rating)]);
      await conn.commit();
      res.status(201).json({ id: String(userId), role: 'doctor', name, email, specialty, experience: Number(experience), price: Number(price), rating: Number(rating), languages });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already registered' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    if (role === 'doctor') {
      const [rows] = await pool.query(`SELECT u.*, d.specialty, d.experience, d.languages, d.price, d.rating FROM users u JOIN doctors d ON d.user_id=u.id WHERE u.email=? LIMIT 1`, [email]);
      const row = Array.isArray(rows) && rows[0];
      if (!row) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, row.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      return res.json({ id: String(row.id), role: 'doctor', name: row.name, email: row.email, specialty: row.specialty, experience: row.experience, price: Number(row.price), rating: Number(row.rating), languages: row.languages ? JSON.parse(row.languages) : [], slots: [] });
    }
    if (role === 'patient') {
      const [rows] = await pool.query(`SELECT u.*, p.age, p.gender, p.phone FROM users u JOIN patients p ON p.user_id=u.id WHERE u.email=? LIMIT 1`, [email]);
      const row = Array.isArray(rows) && rows[0];
      if (!row) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, row.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      return res.json({ id: String(row.id), role: 'patient', name: row.name, email: row.email, age: row.age || 0, gender: row.gender || 'other', medicalHistory: [], prescriptions: [], consultations: [] });
    }
    return res.status(400).json({ message: 'Unsupported role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


