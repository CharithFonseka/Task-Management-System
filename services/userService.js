const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailUtils');

//Generate temporary passwaord 
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + 'A1!';
};

// Create user(only admin)
const createUser = async ({ name, email, role }) => {
  // Email unique check
  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw { status: 400, message: 'Email already exists' };
  }

  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 12);

  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashed, role]
  );

  await sendWelcomeEmail(email, name, tempPassword);

  return { id: result.insertId, name, email, role };
};


const getAllUsers = async (search = '', role = '') => {
  let query = 'SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  const [rows] = await db.query(query, params);
  return rows;
};


const getUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) throw { status: 404, message: 'User not found' };
  return rows[0];
};

//Update user
const updateUser = async (id, { name, email, role }) => {
  const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
  if (existing.length === 0) throw { status: 404, message: 'User not found' };

  
  if (email) {
    const [emailCheck] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    if (emailCheck.length > 0) throw { status: 400, message: 'Email already in use' };
  }

  await db.query(
    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?',
    [name, email, role, id]
  );

  return getUserById(id);
};

// User deactivate 
const deactivateUser = async (id) => {
  const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
  if (existing.length === 0) throw { status: 404, message: 'User not found' };

  await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser };