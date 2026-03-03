import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  body: any;
}

const defaultUser = {
  id: 'cm4default0001admin',
  email: 'admin@dhimahi.com',
  role: 'ADMIN',
  name: 'Admin',
};

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  req.user = defaultUser;
  next();
};

export const authorize = (..._roles: string[]) => {
  return (_req: AuthRequest, _res: Response, next: NextFunction): void => {
    next();
  };
};
