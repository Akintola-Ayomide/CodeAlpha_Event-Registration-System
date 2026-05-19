import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  // Extract token from "Bearer <token>" header
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Internal configuration error.' });
      return;
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const authReq = req as AuthRequest;
    authReq.userId = decoded.id;
    authReq.userRole = decoded.role;
    authReq.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
    return;
  }
};

export default verifyToken;
