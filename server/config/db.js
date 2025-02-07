const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('chess', 'root', 'Strive123@', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => console.log('Conectado ao MySQL'))
  .catch(err => console.log('Erro ao conectar', err));

module.exports = sequelize;