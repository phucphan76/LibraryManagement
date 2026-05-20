CREATE SCHEMA IF NOT EXISTS library_app;


SET search_path TO library_app; -- trỏ vào schema

-------------------------------Tạo ENUM type và các bảng nền tảng-------------------------------
-- =========================
-- 1. ENUM TYPES
-- =========================

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');

CREATE TYPE staff_position AS ENUM ('manager', 'librarian', 'assistant');

CREATE TYPE reader_status AS ENUM ('active', 'inactive', 'banned');


-- =========================
-- 2. ROLES
-- =========================

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);


-- =========================
-- 3. STAFF
-- =========================

CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    position staff_position NOT NULL DEFAULT 'librarian',
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- 4. USERS
-- =========================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL,
    staff_id INT UNIQUE,
    reader_id INT UNIQUE,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_users_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_users_reader
        FOREIGN KEY (reader_id)
        REFERENCES readers(reader_id)
        ON DELETE SET NULL
);


-- =========================
-- 5. READERS
-- =========================

CREATE TABLE readers (
    reader_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address TEXT,
    registered_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status reader_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--------------Insert dữ liệu mẫu ban đầu
INSERT INTO roles (role_name, description)
VALUES
('admin', 'System administrator with full permissions'),
('librarian', 'Library staff with borrowing and returning permissions'),
('reader', 'Library reader');


INSERT INTO staff (full_name, email, phone, position)
VALUES
('Nguyen Van Admin', 'admin@library.com', '0900000001', 'manager'),
('Tran Thi Staff', 'staff@library.com', '0900000002', 'librarian');


INSERT INTO users (username, password_hash, role_id, staff_id)
VALUES
('admin', '$2b$10$.KA2OmXtyRjAcbJYUDiwBOD7suBZh1vwmH/YVL323XBdovF1N7rOi', 1, 1),
('staff', '$2b$10$.KA2OmXtyRjAcbJYUDiwBOD7suBZh1vwmH/YVL323XBdovF1N7rOi', 2, 2);


INSERT INTO readers (full_name, email, phone, address)
VALUES
('Le Van A', 'leva@example.com', '0911111111', 'Da Nang'),
('Pham Thi B', 'phamb@example.com', '0922222222', 'Quang Nam'),
('Hoang Van C', 'hoangc@example.com', '0933333333', 'Hue');

SELECT * FROM roles;
SELECT * FROM staff;
SELECT * FROM users;
SELECT * FROM readers;

--------------------Tạo hệ thống quản lý sách-------------------------

SET search_path TO library_app;

-- =========================
-- 1. CATEGORIES
-- =========================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- =========================
-- 2. AUTHORS
-- =========================

CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    biography TEXT
);


-- =========================
-- 3. BOOKS
-- =========================

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    isbn VARCHAR(20) UNIQUE,

    category_id INT NOT NULL,

    published_year INT
        CHECK (published_year >= 1900
               AND published_year <= EXTRACT(YEAR FROM CURRENT_DATE)),

    total_quantity INT NOT NULL
        CHECK (total_quantity >= 0),

    available_quantity INT NOT NULL
        CHECK (available_quantity >= 0),

    shelf_location VARCHAR(50),

    cover_image TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
);


-- =========================
-- 4. BOOK_AUTHORS
-- =========================

CREATE TABLE book_authors (
    book_id INT NOT NULL,
    author_id INT NOT NULL,

    PRIMARY KEY (book_id, author_id),

    CONSTRAINT fk_book_authors_book
        FOREIGN KEY (book_id)
        REFERENCES books(book_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_authors_author
        FOREIGN KEY (author_id)
        REFERENCES authors(author_id)
        ON DELETE CASCADE
);

------------Insert dữ liệu mẫu
-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (category_name, description)
VALUES
('Programming', 'Books about programming and software development'),
('Database', 'Books about databases and SQL'),
('Networking', 'Books about computer networks'),
('Artificial Intelligence', 'Books about AI and machine learning');

-- =========================
-- AUTHORS
-- =========================
INSERT INTO authors (full_name, biography)
VALUES
('Robert C. Martin', 'Software engineer and author'),
('Andrew S. Tanenbaum', 'Computer networks expert'),
('Thomas H. Cormen', 'Algorithm researcher'),
('Ian Goodfellow', 'Deep learning researcher');

-- =========================
-- BOOKS
-- =========================
INSERT INTO books (
    title,
    isbn,
    category_id,
    published_year,
    total_quantity,
    available_quantity,
    shelf_location,
    cover_image
)
VALUES
(
    'Clean Code',
    '9780132350884',
    1,
    2008,
    5,
    5,
    'A1',
    '/covers/clean_code.png'
),
(
    'Computer Networks',
    '9780132126953',
    3,
    2010,
    3,
    3,
    'B2',
    '/covers/computer_networks.png'
),
(
    'Introduction to Algorithms',
    '9780262033848',
    1,
    2009,
    4,
    4,
    'C3',
    '/covers/intro_algorithms.png'
),
(
    'Deep Learning',
    '9780262035613',
    4,
    2016,
    2,
    2,
    'D1',
    '/covers/deep_learning.png'
);

-- =========================
-- BOOK_AUTHORS
-- =========================
INSERT INTO book_authors (book_id, author_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

---------------------Tạo bảng mượn sách------------------------
---Chạy SQL tạo ENUM
SET search_path TO library_app;
CREATE TYPE loan_status AS ENUM ('active', 'returned', 'cancelled');
CREATE TYPE return_status AS ENUM ('borrowed', 'returned', 'lost');

---Tạo bảng chính sách phạt
CREATE TABLE fine_policy (
    policy_id SERIAL PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    max_borrow_days INT NOT NULL DEFAULT 30 CHECK (max_borrow_days > 0),
    max_books_per_reader INT NOT NULL DEFAULT 3 CHECK (max_books_per_reader > 0),
    fine_per_day NUMERIC(12,2) NOT NULL DEFAULT 5000 CHECK (fine_per_day >= 0),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

---Tạo bảng phiếu mượn
CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    reader_id INT NOT NULL,
    staff_id INT NOT NULL,
    policy_id INT NOT NULL,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status loan_status NOT NULL DEFAULT 'active',
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_loans_reader
        FOREIGN KEY (reader_id)
        REFERENCES readers(reader_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_loans_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_loans_policy
        FOREIGN KEY (policy_id)
        REFERENCES fine_policy(policy_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_loans_due_date
        CHECK (due_date >= borrow_date)
);

---Tạo bảng chi tiết mượn
CREATE TABLE loan_details (
    loan_detail_id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL,
    book_id INT NOT NULL,
    return_status return_status NOT NULL DEFAULT 'borrowed',
    returned_date DATE,
    note TEXT,

    CONSTRAINT fk_loan_details_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(loan_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_loan_details_book
        FOREIGN KEY (book_id)
        REFERENCES books(book_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_loan_book
        UNIQUE (loan_id, book_id)
);

---Insert chính sách phạt mẫu
INSERT INTO fine_policy (
    policy_name,
    max_borrow_days,
    max_books_per_reader,
    fine_per_day,
    effective_date,
    is_active
)
VALUES (
    'Default policy',
    30,
    3,
    5000,
    CURRENT_DATE,
    TRUE
);

---Test
SELECT * FROM fine_policy;
SELECT * FROM loans;
SELECT * FROM loan_details;

---------------------Trigger xử lý mượn sách-------------------
/* 
1. Tự gán due_date theo policy
2. Kiểm tra độc giả mượn tối đa 3 sách
3. Tự giảm available_quantity khi thêm loan_details
*/

---Tạo function tự set due_date
SET search_path TO library_app;

CREATE OR REPLACE FUNCTION fn_set_due_date()
RETURNS TRIGGER AS $$
DECLARE
    v_max_borrow_days INT;
BEGIN
    SELECT max_borrow_days
    INTO v_max_borrow_days
    FROM fine_policy
    WHERE policy_id = NEW.policy_id;

    IF NEW.due_date IS NULL THEN
        NEW.due_date := NEW.borrow_date + v_max_borrow_days;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---Tạo trigger cho bảng loans
CREATE TRIGGER trg_set_due_date
BEFORE INSERT ON loans
FOR EACH ROW
EXECUTE FUNCTION fn_set_due_date();
/* sửa due_date cho phép NULL trước khi trigger tự gán để
tiện hơn cho backend */
ALTER TABLE loans
ALTER COLUMN due_date DROP NOT NULL;

---Tạo function kiểm tra và giảm số lượng sách khi mượn
CREATE OR REPLACE FUNCTION fn_before_insert_loan_detail()
RETURNS TRIGGER AS $$
DECLARE
    v_available_quantity INT;
    v_reader_id INT;
    v_current_borrowed_count INT;
    v_max_books INT;
BEGIN
    -- Lấy số lượng sách còn lại
    SELECT available_quantity
    INTO v_available_quantity
    FROM books
    WHERE book_id = NEW.book_id;

    IF v_available_quantity IS NULL THEN
        RAISE EXCEPTION 'Book does not exist';
    END IF;

    IF v_available_quantity <= 0 THEN
        RAISE EXCEPTION 'Book ID % is not available for borrowing', NEW.book_id;
    END IF;

    -- Lấy reader_id từ phiếu mượn
    SELECT l.reader_id, fp.max_books_per_reader
    INTO v_reader_id, v_max_books
    FROM loans l
    JOIN fine_policy fp ON l.policy_id = fp.policy_id
    WHERE l.loan_id = NEW.loan_id;

    IF v_reader_id IS NULL THEN
        RAISE EXCEPTION 'Loan does not exist';
    END IF;

    -- Đếm số sách độc giả đang mượn chưa trả
    SELECT COUNT(*)
    INTO v_current_borrowed_count
    FROM loan_details ld
    JOIN loans l ON ld.loan_id = l.loan_id
    WHERE l.reader_id = v_reader_id
      AND l.status = 'active'
      AND ld.return_status = 'borrowed';

    IF v_current_borrowed_count >= v_max_books THEN
        RAISE EXCEPTION 'Reader ID % has reached the borrowing limit of % books',
            v_reader_id, v_max_books;
    END IF;

    -- Giảm số lượng sách còn lại
    UPDATE books
    SET available_quantity = available_quantity - 1
    WHERE book_id = NEW.book_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---Tạo trigger cho loan_details
CREATE TRIGGER trg_before_insert_loan_detail
BEFORE INSERT ON loan_details
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_loan_detail();

---Test thử mượn sách
INSERT INTO loans (reader_id, staff_id, policy_id, note)
VALUES (1, 2, 1, 'First borrowing test')
RETURNING *;

INSERT INTO loan_details (loan_id, book_id)
VALUES
(1, 1),
(1, 2);

SELECT * FROM loan_details;

SELECT book_id, title, total_quantity, available_quantity
FROM books
ORDER BY book_id;

--------------------Tạo bảng trả sách và phí phạt------------------------
/* returns
   fines
*/

---Tạo ENUM cho phí phạt
SET search_path TO library_app;
CREATE TYPE fine_status AS ENUM ('unpaid', 'paid', 'cancelled');

---Tạo bảng returns
CREATE TABLE returns (
    return_id SERIAL PRIMARY KEY,
    loan_detail_id INT NOT NULL UNIQUE,
    staff_id INT NOT NULL,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_returns_loan_detail
        FOREIGN KEY (loan_detail_id)
        REFERENCES loan_details(loan_detail_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_returns_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
        ON DELETE RESTRICT
);

---Tạo bảng fines
CREATE TABLE fines (
    fine_id SERIAL PRIMARY KEY,
    return_id INT NOT NULL UNIQUE,
    loan_id INT NOT NULL,
    reader_id INT NOT NULL,
    overdue_days INT NOT NULL DEFAULT 0 CHECK (overdue_days >= 0),
    fine_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (fine_amount >= 0),
    status fine_status NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fines_return
        FOREIGN KEY (return_id)
        REFERENCES returns(return_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fines_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(loan_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_fines_reader
        FOREIGN KEY (reader_id)
        REFERENCES readers(reader_id)
        ON DELETE RESTRICT
);

---Test nhanh
SELECT * FROM returns;
SELECT * FROM fines;

----------------------Trigger xử lý trả sách------------------------
/*
1. Đổi trạng thái sách đã trả
2. Cập nhật ngày trả
3. Tăng lại số lượng sách còn trong kho
4. Tự tính phí phạt nếu quá hạn
5. Nếu trả hết sách trong phiếu thì đổi loans.status = returned
*/

---Tạo function xử lý trả sách
SET search_path TO library_app;

CREATE OR REPLACE FUNCTION fn_after_insert_return()
RETURNS TRIGGER AS $$
DECLARE
    v_loan_id INT;
    v_book_id INT;
    v_reader_id INT;
    v_due_date DATE;
    v_fine_per_day NUMERIC(12,2);
    v_overdue_days INT;
    v_remaining_borrowed INT;
BEGIN
    -- Lấy thông tin từ loan_detail
    SELECT
        ld.loan_id,
        ld.book_id,
        l.reader_id,
        l.due_date,
        fp.fine_per_day
    INTO
        v_loan_id,
        v_book_id,
        v_reader_id,
        v_due_date,
        v_fine_per_day
    FROM loan_details ld
    JOIN loans l ON ld.loan_id = l.loan_id
    JOIN fine_policy fp ON l.policy_id = fp.policy_id
    WHERE ld.loan_detail_id = NEW.loan_detail_id;

    IF v_loan_id IS NULL THEN
        RAISE EXCEPTION 'Loan detail does not exist';
    END IF;

    -- Không cho trả lại sách đã trả
    IF EXISTS (
        SELECT 1
        FROM loan_details
        WHERE loan_detail_id = NEW.loan_detail_id
          AND return_status = 'returned'
    ) THEN
        RAISE EXCEPTION 'This book has already been returned';
    END IF;

    -- Cập nhật trạng thái chi tiết mượn
    UPDATE loan_details
    SET return_status = 'returned',
        returned_date = NEW.return_date
    WHERE loan_detail_id = NEW.loan_detail_id;

    -- Tăng lại số lượng sách
    UPDATE books
    SET available_quantity = available_quantity + 1
    WHERE book_id = v_book_id;

    -- Tính số ngày quá hạn
    v_overdue_days := GREATEST(NEW.return_date - v_due_date, 0);

    -- Nếu quá hạn thì tạo phí phạt
    IF v_overdue_days > 0 THEN
        INSERT INTO fines (
            return_id,
            loan_id,
            reader_id,
            overdue_days,
            fine_amount,
            status
        )
        VALUES (
            NEW.return_id,
            v_loan_id,
            v_reader_id,
            v_overdue_days,
            v_overdue_days * v_fine_per_day,
            'unpaid'
        );
    END IF;

    -- Kiểm tra còn sách nào trong phiếu chưa trả không
    SELECT COUNT(*)
    INTO v_remaining_borrowed
    FROM loan_details
    WHERE loan_id = v_loan_id
      AND return_status = 'borrowed';

    -- Nếu không còn sách mượn thì cập nhật phiếu mượn
    IF v_remaining_borrowed = 0 THEN
        UPDATE loans
        SET status = 'returned'
        WHERE loan_id = v_loan_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---Tạo trigger cho bảng returns
CREATE TRIGGER trg_after_insert_return
AFTER INSERT ON returns
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_return();

----------------------------------Tạo VIEW báo cáo---------------------------------
SET search_path TO library_app;

-- 1. View danh sách sách kèm thể loại và tác giả
CREATE OR REPLACE VIEW vw_books_full_info AS
SELECT
    b.book_id,
    b.title,
    b.isbn,
    c.category_name,
    STRING_AGG(a.full_name, ', ') AS authors,
    b.published_year,
    b.total_quantity,
    b.available_quantity,
    b.shelf_location,
    b.cover_image
FROM books b
JOIN categories c ON b.category_id = c.category_id
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
GROUP BY
    b.book_id,
    b.title,
    b.isbn,
    c.category_name,
    b.published_year,
    b.total_quantity,
    b.available_quantity,
    b.shelf_location,
    b.cover_image;


-- 2. View sách đang được mượn
CREATE OR REPLACE VIEW vw_current_borrowed_books AS
SELECT
    l.loan_id,
    ld.loan_detail_id,
    r.reader_id,
    r.full_name AS reader_name,
    b.book_id,
    b.title AS book_title,
    l.borrow_date,
    l.due_date,
    s.full_name AS staff_name
FROM loan_details ld
JOIN loans l ON ld.loan_id = l.loan_id
JOIN readers r ON l.reader_id = r.reader_id
JOIN books b ON ld.book_id = b.book_id
JOIN staff s ON l.staff_id = s.staff_id
WHERE ld.return_status = 'borrowed'
  AND l.status = 'active';


-- 3. View danh sách quá hạn
CREATE OR REPLACE VIEW vw_overdue_loans AS
SELECT
    l.loan_id,
    ld.loan_detail_id,
    r.reader_id,
    r.full_name AS reader_name,
    r.phone,
    b.title AS book_title,
    l.borrow_date,
    l.due_date,
    CURRENT_DATE - l.due_date AS overdue_days
FROM loan_details ld
JOIN loans l ON ld.loan_id = l.loan_id
JOIN readers r ON l.reader_id = r.reader_id
JOIN books b ON ld.book_id = b.book_id
WHERE ld.return_status = 'borrowed'
  AND l.status = 'active'
  AND CURRENT_DATE > l.due_date;


-- 4. View lịch sử trả sách
CREATE OR REPLACE VIEW vw_return_history AS
SELECT
    rt.return_id,
    l.loan_id,
    r.full_name AS reader_name,
    b.title AS book_title,
    l.borrow_date,
    l.due_date,
    rt.return_date,
    GREATEST(rt.return_date - l.due_date, 0) AS overdue_days,
    s.full_name AS staff_name
FROM returns rt
JOIN loan_details ld ON rt.loan_detail_id = ld.loan_detail_id
JOIN loans l ON ld.loan_id = l.loan_id
JOIN readers r ON l.reader_id = r.reader_id
JOIN books b ON ld.book_id = b.book_id
JOIN staff s ON rt.staff_id = s.staff_id;


-- 5. View phí phạt
CREATE OR REPLACE VIEW vw_fines_detail AS
SELECT
    f.fine_id,
    r.full_name AS reader_name,
    r.phone,
    l.loan_id,
    f.overdue_days,
    f.fine_amount,
    f.status,
    f.created_at
FROM fines f
JOIN readers r ON f.reader_id = r.reader_id
JOIN loans l ON f.loan_id = l.loan_id;


-- 6. View thống kê tổng quan dashboard
CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM books) AS total_books,
    (SELECT COALESCE(SUM(total_quantity), 0) FROM books) AS total_book_copies,
    (SELECT COALESCE(SUM(available_quantity), 0) FROM books) AS available_book_copies,
    (SELECT COUNT(*) FROM readers WHERE status = 'active') AS active_readers,
    (SELECT COUNT(*) FROM loans WHERE status = 'active') AS active_loans,
    (SELECT COUNT(*) FROM vw_overdue_loans) AS overdue_books,
    (SELECT COALESCE(SUM(fine_amount), 0) FROM fines) AS total_fines,
    (SELECT COALESCE(SUM(fine_amount), 0) FROM fines WHERE status = 'unpaid') AS unpaid_fines;

SELECT * FROM vw_books_full_info;
SELECT * FROM vw_current_borrowed_books;
SELECT * FROM vw_overdue_loans;
SELECT * FROM vw_return_history;
SELECT * FROM vw_fines_detail;
SELECT * FROM vw_dashboard_summary;

------------------------------Tạo INDEX để tối ưu tìm kiếm----------------------------------
SET search_path TO library_app;

-- USERS
CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_users_role_id
ON users(role_id);


-- STAFF
CREATE INDEX idx_staff_email
ON staff(email);

CREATE INDEX idx_staff_phone
ON staff(phone);


-- READERS
CREATE INDEX idx_readers_name
ON readers(full_name);

CREATE INDEX idx_readers_phone
ON readers(phone);

CREATE INDEX idx_readers_status
ON readers(status);


-- BOOKS
CREATE INDEX idx_books_title
ON books(title);

CREATE INDEX idx_books_isbn
ON books(isbn);

CREATE INDEX idx_books_category_id
ON books(category_id);

CREATE INDEX idx_books_available_quantity
ON books(available_quantity);


-- LOANS
CREATE INDEX idx_loans_reader_id
ON loans(reader_id);

CREATE INDEX idx_loans_staff_id
ON loans(staff_id);

CREATE INDEX idx_loans_status
ON loans(status);

CREATE INDEX idx_loans_due_date
ON loans(due_date);


-- LOAN DETAILS
CREATE INDEX idx_loan_details_loan_id
ON loan_details(loan_id);

CREATE INDEX idx_loan_details_book_id
ON loan_details(book_id);

CREATE INDEX idx_loan_details_return_status
ON loan_details(return_status);


-- RETURNS
CREATE INDEX idx_returns_return_date
ON returns(return_date);


-- FINES
CREATE INDEX idx_fines_status
ON fines(status);

CREATE INDEX idx_fines_reader_id
ON fines(reader_id);

---Test
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'library_app'
ORDER BY tablename, indexname;

---------------------------Tạo FUNCTION tính phí phạt------------------------------
SET search_path TO library_app;

CREATE OR REPLACE FUNCTION fn_calculate_fine(
    p_due_date DATE,
    p_return_date DATE,
    p_fine_per_day NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    v_overdue_days INT;
    v_fine_amount NUMERIC;
BEGIN
    v_overdue_days := GREATEST(p_return_date - p_due_date, 0);
    v_fine_amount := v_overdue_days * p_fine_per_day;

    RETURN v_fine_amount;
END;
$$ LANGUAGE plpgsql;

----------------------Tạo PROCEDURE lập phiếu mượn-----------------------
/*
Nhận reader_id, staff_id, danh sách book_id
Tự tạo loans
Tự thêm loan_details
Trigger ở bước 7 sẽ tự kiểm tra tồn kho và giảm số lượng sách
Nếu lỗi thì rollback toàn bộ
*/
SET search_path TO library_app;

CREATE OR REPLACE PROCEDURE sp_create_loan(
    IN p_reader_id INT,
    IN p_staff_id INT,
    IN p_book_ids INT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_policy_id INT;
    v_loan_id INT;
    v_book_id INT;
BEGIN
    SELECT policy_id
    INTO v_policy_id
    FROM fine_policy
    WHERE is_active = TRUE
    ORDER BY effective_date DESC
    LIMIT 1;

    IF v_policy_id IS NULL THEN
        RAISE EXCEPTION 'No active fine policy found';
    END IF;

    INSERT INTO loans (
        reader_id,
        staff_id,
        policy_id,
        note
    )
    VALUES (
        p_reader_id,
        p_staff_id,
        v_policy_id,
        'Created by stored procedure'
    )
    RETURNING loan_id INTO v_loan_id;

    FOREACH v_book_id IN ARRAY p_book_ids
    LOOP
        INSERT INTO loan_details (
            loan_id,
            book_id
        )
        VALUES (
            v_loan_id,
            v_book_id
        );
    END LOOP;
END;
$$;




-- Test dummy data for fines
-- Modify loan 1 to be overdue
UPDATE loans SET borrow_date = '2026-04-01', due_date = '2026-05-01' WHERE loan_id = 1;
-- Return the first book of loan 1, which will trigger fine calculation
INSERT INTO returns (loan_detail_id, staff_id, return_date, note) VALUES (1, 2, '2026-05-20', 'Returned late');
