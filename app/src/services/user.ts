import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../database/repository/user';
import { RoleRepository } from '../database/repository/role';
import { ISError } from '../errors/ErrorFactory';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

class UserService {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    req.validate(['email', 'password']);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.build('BadRequest', 'Email and Password required');
    }

    try {
      if (await userRepository.getUserByEmail(email)) {
        return res.build('Conflict', 'User already exists');
      }
      const desiredRole = 'User';
      const role = await roleRepository.getRoleByName(desiredRole);
      if (!role) {
        return res.build('BadRequest', `"User" role don't exist`);
      }
      const roleId = role.id;
      const tokens = 10;
      const newUser = await userRepository.createUser({
        email,
        password,
        tokens,
        roleId,
      });
      res.build('Created', 'User registration complete', newUser);
    } catch (err) {
      next(ISError('Error during  user registration.', err));
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    req.validate(['email', 'password']);
    const { email, password } = req.body;

    try {
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.build('BadRequest', 'User email not found');
      }

      // Verifica della password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.build('Unauthorized', 'User password incorrect');
      }

      let token;
      // Generazione del token JWT Asymmetrico
      const private_key = await fs.promises.readFile('./src/services/jwtRS256.key');
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * parseInt(process.env.JWT_EXP_H || '1'),
        },
        private_key,
        { algorithm: 'RS256' }
      );


      res.build('OK', 'Login completed', token);
    } catch (err) {
      next(ISError('Error during login.', err));
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.getUsers();
      if (!users) {
        return res.build('NotFound', 'Users not found');
      }

      res.build('OK', 'Users list', users);
    } catch (err) {
      next(ISError('Error during user retreival.'), err);
    }
  }
}

export default UserService;
