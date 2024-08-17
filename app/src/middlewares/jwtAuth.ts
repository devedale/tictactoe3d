import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import fs from 'fs';

const authRSAMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.build('Unauthorized', "La richiesta non ha il token nell'header.");
  }

  try {
    const public_key = await fs.promises.readFile('./src/middlewares/jwtRS256.key.pub');
    const decoded = jwt.verify(token, public_key, { algorithms: ['RS256'] });
    req['decodedToken'] = decoded;
    req['userId'] = decoded.userId;
    req['userEmail'] = decoded.email;
    console.log('\ndecoded', decoded, '\n');
    next();
  } catch (err) {
    console.log(err);

    return res.build('Forbidden', 'Il token non è valido.');
  }
};

export default authRSAMiddleware;
