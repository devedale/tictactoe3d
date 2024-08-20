import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../database/repository/user';
import { RoleRepository } from '../database/repository/role';
import { ISError } from '../errors/ErrorFactory';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

class UserService {
  /**
   * Registers a new user.
   *
   * @param {Request} req - The Express request object containing user registration details.
   * @param {Response} res - The Express response object used to send the response.
   * @param {NextFunction} next - The next middleware function.
   */
  async registerUser(req: Request, res: Response, next: NextFunction) {
    req.validateBody(['email', 'password']);
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
        return res.build('BadRequest', `"User" role doesn't exist`);
      }
      const roleId = role.id;
      const tokens = 0;
      const newUser = await userRepository.createUser({
        email,
        password,
        tokens,
        roleId,
      });
      res.build('Created', 'User registration complete', newUser);
    } catch (err) {
      next(ISError('Error during user registration.', err));
    }
  }

  /**
   * Logs in a user and generates a JWT token.
   *
   * @param {Request} req - The Express request object containing login details.
   * @param {Response} res - The Express response object used to send the response.
   * @param {NextFunction} next - The next middleware function.
   */
  async loginUser(req: Request, res: Response, next: NextFunction) {
    req.validateBody(['email', 'password']);
    const { email, password } = req.body;

    try {
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.build('BadRequest', 'User email not found');
      }

      // Verify the password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.build('Unauthorized', 'User password incorrect');
      }

      // Generate JWT token with asymmetric encryption
      let token;
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

  /**
   * Retrieves a list of all users.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object used to send the response.
   * @param {NextFunction} next - The next middleware function.
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.getUsers();
      if (!users) {
        return res.build('NotFound', 'Users not found');
      }

      res.build('OK', 'Users list', users);
    } catch (err) {
      next(ISError('Error during user retrieval.', err));
    }
  }

  /**
   * Allows an admin to refill tokens for a user.
   *
   * @param {Request} req - The Express request object containing user ID and token amount.
   * @param {Response} res - The Express response object used to send the response.
   * @param {NextFunction} next - The next middleware function.
   */
  async rechargeUser(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.params.id);
    req.validateQuery(['tokens']);
    const { tokens } = req.query;

    try {
      const refillingUserId = parseInt(req['userId']);

      if (isNaN(userId)) {
        return res.build('BadRequest', 'User ID is required and must be a valid number');
      }
      if (!(await userRepository.userIdExist(userId))) {
        return res.build('NotFound', 'User not found');
      }

      const user = await userRepository.getUserById(userId);
      if (!user) {
        return res.build('BadRequest', 'User not found');
      }

      const role = await userRepository.getUserRoleNameById(refillingUserId);
      if (role !== 'Admin') {
        return res.build('Forbidden', 'Normal users cannot refill tokens');
      }

      const updatedTokens = parseFloat(user.tokens) + parseFloat(tokens);
      const result = await userRepository.updateUser(user, { tokens: updatedTokens });
      if (result === 0) {
        next(ISError('Error during user refilling.', new Error('updateUser failed')));
      } else {
        return res.build('OK', `User now has ${parseFloat(updatedTokens.toFixed(2))} tokens`, result);
      }
    } catch (err) {
      next(ISError('Error during user retrieval.', err));
    }
  }
}

export default UserService;
