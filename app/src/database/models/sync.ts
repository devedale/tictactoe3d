import sequelize from '../connection';
import { Role } from './role';
import { User } from './user';


// Sincronizza tutti i modelli con il database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((error) => {
    console.error('Error creating database & tables:', error);
  });
