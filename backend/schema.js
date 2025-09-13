const pool = require('./db');

async function ensureSchema() {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('doctor','patient') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createDoctors = `
    CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      specialty VARCHAR(100),
      experience INT,
      languages JSON,
      price DECIMAL(10,2),
      rating DECIMAL(3,2) DEFAULT 4.5,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createPatients = `
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      age INT,
      gender ENUM('male','female','other'),
      phone VARCHAR(20),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createAppointments = `
    CREATE TABLE IF NOT EXISTS appointments (
      appointment_id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_user_id INT NOT NULL,
      patient_user_id INT NOT NULL,
      appointment_date DATETIME NOT NULL,
      status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const createPayments = `
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INT AUTO_INCREMENT PRIMARY KEY,
      appointment_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const conn = await pool.getConnection();
  try {
    await conn.query(createUsers);
    await conn.query(createDoctors);
    await conn.query(createPatients);
    await conn.query(createAppointments);
    await conn.query(createPayments);
  } finally {
    conn.release();
  }
}

module.exports = { ensureSchema };


