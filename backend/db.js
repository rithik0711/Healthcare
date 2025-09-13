const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Revathy@2509',
  database: 'telemedicine'
});

module.exports = pool.promise();
