const connection = require('./db');

connection.query('SELECT * FROM usuarios', (err, results) => {
  if (err) throw err;
  console.log(results);
});