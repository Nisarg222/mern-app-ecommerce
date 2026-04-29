require('dotenv').config();

const sequelize = require('./config/db');
require('./models'); // register all models & associations before sync

const app  = require('./app');
const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established.');

    // alter:true keeps the schema in sync with models during development
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
