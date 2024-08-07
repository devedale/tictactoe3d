import { RoleRepository } from './repository/role';
import { UserRepository } from './repository/user';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default async () => {
  let retries = 0;
  let dbReady = false;

  while (!dbReady && retries < MAX_RETRIES) {
    try {
      const roleRepository = new RoleRepository();
      const userRepository = new UserRepository();

      // Check if role with id 1 exists
      const role_1 = await roleRepository.getRoleById(1);

      if (!role_1) {
        // Create roles
        await roleRepository.createRole({ name: 'user' });
        await roleRepository.createRole({ name: 'admin' });

        // Create admin user
        await userRepository.createAdmin({
          nickname: 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@email.com',
          password: process.env.ADMIN_PASSWORD || 'admin_password',
        });

        dbReady = true;
      } else {
        dbReady = true;
      }
    } catch (err) {
      console.log(`Attempt ${retries + 1} failed:`, err);
      retries++;

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  if (!dbReady) {
    console.error(`Database setup failed after ${MAX_RETRIES} retries.`);
  }
};
