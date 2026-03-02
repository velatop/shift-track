require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/views/login.html');
});
app.use('/api/auth',      require('./src/routes/authRoutes'));
app.use('/api/employees', require('./src/routes/employeeRoutes'));
app.use('/api/shifts',    require('./src/routes/shiftRoutes'));

let server;
sequelize.sync()
  .then(() => {
    console.log('Synchronized database');
    server = app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch(err => console.error('Error DB:', err));

module.exports = { app, server };