const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [userResult] = await conn.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, passwordHash, 'patient']);
      const userId = userResult.insertId;
      await conn.query('INSERT INTO patients (user_id, age, gender, phone) VALUES (?,?,?,?)', [userId, age || null, gender || null, phone || null]);
      await conn.commit();
      res.status(201).json({ id: String(userId), name, email, age: age || 0, gender: gender || 'other' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, p.age, p.gender, p.phone FROM users u JOIN patients p ON p.user_id=u.id ORDER BY u.created_at DESC`);
    const patients = (rows || []).map(p => ({ id: String(p.id), name: p.name, email: p.email, age: p.age || 0, gender: p.gender || 'other' }));
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, p.age, p.gender, p.phone FROM users u JOIN patients p ON p.user_id=u.id WHERE u.id=? LIMIT 1`, [id]);
    const p = Array.isArray(rows) && rows[0];
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json({ id: String(p.id), name: p.name, email: p.email, age: p.age || 0, gender: p.gender || 'other' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, gender, phone } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (name || email) await conn.query('UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email) WHERE id=?', [name || null, email || null, id]);
      if (typeof age !== 'undefined' || gender || phone) await conn.query('UPDATE patients SET age=COALESCE(?,age), gender=COALESCE(?,gender), phone=COALESCE(?,phone) WHERE user_id=?', [typeof age === 'number' ? age : null, gender || null, phone || null, id]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, p.age, p.gender, p.phone FROM users u JOIN patients p ON p.user_id=u.id WHERE u.id=? LIMIT 1`, [id]);
    const p = Array.isArray(rows) && rows[0];
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json({ id: String(p.id), name: p.name, email: p.email, age: p.age || 0, gender: p.gender || 'other' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


