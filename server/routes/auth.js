const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, full_name, email, phone, address } = req.body;

  const client = await require('pg').Pool.prototype.connect.call(
    require('../db')._pool || new (require('pg')).Pool({
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DATABASE,
    })
  );

  try {
    await client.query('BEGIN');
    await client.query('SET search_path TO library_app');

    // Check username
    const userExist = await client.query('SELECT user_id FROM users WHERE username = $1', [username]);
    if (userExist.rows.length > 0) {
      throw new Error('Username already exists');
    }

    // Get reader role id
    const roleRes = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['reader']);
    if (roleRes.rows.length === 0) throw new Error('Role "reader" not found in DB');
    const roleId = roleRes.rows[0].role_id;

    // Insert reader
    const readerRes = await client.query(
      'INSERT INTO readers (full_name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING reader_id',
      [full_name, email, phone, address]
    );
    const readerId = readerRes.rows[0].reader_id;

    // Hash password & Insert user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await client.query(
      'INSERT INTO users (username, password_hash, role_id, reader_id) VALUES ($1, $2, $3, $4)',
      [username, hash, roleId, readerId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message || 'Error registering user' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(`
      SELECT u.user_id, u.username, u.password_hash, u.status, r.role_name, u.reader_id, u.staff_id 
      FROM library_app.users u 
      JOIN library_app.roles r ON u.role_id = r.role_id 
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
      user: {
        id: user.user_id,
        role: user.role_name,
        readerId: user.reader_id,
        staffId: user.staff_id,
        username: user.username
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
