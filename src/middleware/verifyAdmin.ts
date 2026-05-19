import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    return;
  }

  if (authReq.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }

  next();
};

export default verifyAdmin;
