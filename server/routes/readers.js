const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Only staff can access reader management
const requireStaff = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return res.status(403).json({ error: 'Access denied: Staff only' });
  }
  next();
};

// Get all readers
router.get('/', auth, requireStaff, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.reader_id, r.full_name, r.email, r.phone, r.address, r.registered_date, r.status, u.username
      FROM library_app.readers r
      LEFT JOIN library_app.users u ON r.reader_id = u.reader_id
      ORDER BY r.reader_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reader status (block/unblock)
router.put('/:id/status', auth, requireStaff, async (req, res) => {
  const { status } = req.body; // 'active' or 'inactive'
  
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

    // Update reader status
    await client.query('UPDATE readers SET status = $1 WHERE reader_id = $2', [status, req.params.id]);
    
    // Update user status
    await client.query('UPDATE users SET status = $1 WHERE reader_id = $2', [status, req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Reader status updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
