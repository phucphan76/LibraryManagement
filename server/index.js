const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Set schema path for every connection in this session if needed, 
// but it's better to explicitly qualify or run a query before.
// Actually, since we're using a pool, we can set search_path globally or prefix tables.
// Let's use library_app prefix or set search path.

const runQuery = async (queryText, params) => {
  return db.query(`SET search_path TO library_app; ` + queryText, params);
};

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/readers', require('./routes/readers'));

// 1. Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM library_app.vw_dashboard_summary');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Books
app.get('/api/books', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM library_app.vw_books_full_info');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM library_app.vw_books_full_info WHERE book_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Checkout (Loan)
app.post('/api/loans/checkout', async (req, res) => {
  const { userId, bookIds } = req.body; // bookIds is an array
  // We mock staff_id = 2, policy_id = 1
  try {
    // We should use a transaction, but since pg pool handles single queries, we'll do it in a BEGIN/COMMIT block
    const client = await require('pg').Pool.prototype.connect.call(require('./db')._pool || new (require('pg')).Pool({
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DATABASE,
    }));
    
    try {
      await client.query('BEGIN');
      await client.query('SET search_path TO library_app');

      // Create loan
      const loanRes = await client.query(
        'INSERT INTO loans (reader_id, staff_id, policy_id, note) VALUES ($1, 2, 1, $2) RETURNING loan_id, due_date',
        [userId, 'Created via API']
      );
      const loanId = loanRes.rows[0].loan_id;

      // Insert details
      for (const bookId of bookIds) {
        await client.query('INSERT INTO loan_details (loan_id, book_id) VALUES ($1, $2)', [loanId, bookId]);
      }

      await client.query('COMMIT');
      res.json({ message: 'Checkout successful', loanId, dueDate: loanRes.rows[0].due_date });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Error processing checkout' });
  }
});

// 4. Checkin Search
app.get('/api/loans/checkin-search', async (req, res) => {
  const { q } = req.query;
  try {
    const loanRes = await db.query(`
      SELECT loan_id, reader_id, reader_name, borrow_date, due_date 
      FROM library_app.vw_current_borrowed_books 
      WHERE loan_id::text = $1 OR reader_id::text = $1
      LIMIT 1
    `, [q]);

    if (loanRes.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found or already returned' });
    }

    const loan = loanRes.rows[0];
    
    const detailsRes = await db.query(`
      SELECT ld.loan_detail_id as "detailId", ld.book_id as "bookId", b.title, ld.return_status as "returnStatus", 
      (CURRENT_DATE > l.due_date) as "isOverdue", 
      GREATEST(CURRENT_DATE - l.due_date, 0) * 5000 as fine
      FROM library_app.loan_details ld
      JOIN library_app.books b ON ld.book_id = b.book_id
      JOIN library_app.loans l ON ld.loan_id = l.loan_id
      WHERE ld.loan_id = $1
    `, [loan.loan_id]);

    res.json({
      id: loan.loan_id,
      userId: loan.reader_id,
      borrowDate: loan.borrow_date,
      dueDate: loan.due_date,
      details: detailsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Return book
app.post('/api/loans/return', async (req, res) => {
  const { detailId } = req.body;
  // staff_id = 2 mock
  try {
    await db.query('SET search_path TO library_app');
    await db.query('INSERT INTO returns (loan_detail_id, staff_id, note) VALUES ($1, 2, $2)', [detailId, 'Returned via API']);
    res.json({ message: 'Return processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Error processing return' });
  }
});

// 5.5 GetAllLoans for LoanManagement
app.get('/api/loans', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.loan_id, 
        r.full_name as reader_name, 
        l.borrow_date, 
        l.due_date, 
        l.status,
        (SELECT COUNT(*) FROM library_app.loan_details ld WHERE ld.loan_id = l.loan_id) as total_books,
        (SELECT COUNT(*) FROM library_app.loan_details ld WHERE ld.loan_id = l.loan_id AND ld.return_status = 'returned') as returned_books
      FROM library_app.loans l
      JOIN library_app.readers r ON l.reader_id = r.reader_id
      ORDER BY l.borrow_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Reader's history
app.get('/api/users/:id/loans', async (req, res) => {
  try {
    const activeRes = await db.query(`
      SELECT loan_id, borrow_date, due_date, book_title as title, 'borrowed' as status 
      FROM library_app.vw_current_borrowed_books WHERE reader_id = $1
    `, [req.params.id]);
    
    const historyRes = await db.query(`
      SELECT loan_id, borrow_date, due_date, return_date, book_title as title, 'returned' as status, overdue_days * 5000 as fine
      FROM library_app.vw_return_history WHERE reader_name = (SELECT full_name FROM library_app.readers WHERE reader_id = $1)
    `, [req.params.id]);

    res.json([...activeRes.rows, ...historyRes.rows]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
