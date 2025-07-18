import { injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../../config';

export class Principal implements interfaces.Principal {
  public details: any;

  public constructor(details: any) {
    this.details = details;
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public isResourceOwner(resourceId: any): Promise<boolean> {
    return Promise.resolve(resourceId === 1111);
  }

  public isInRole(role: string): Promise<boolean> {
    return Promise.resolve(role === 'admin');
  }
}

@injectable()
export class AuthProvider implements interfaces.AuthProvider {
  public async getUser(
    req: Request,
    _res: Response,
    _next: NextFunction
  ): Promise<interfaces.Principal> {
    const authHeader = (req.headers['authorization'] || '').toString().trim();
    let user = null;

    if (authHeader) {
      const parts = authHeader.split(/\s+/); // Split on one or more whitespace characters
      if (
        parts.length >= 2 &&
        parts[0].toLowerCase() === 'bearer' &&
        parts[1]
      ) {
        try {
          user = verify(parts[1], config.secret);
        } catch (error) {
          console.log(error);
        }
      }
    }

    return new Principal(user);
  }
}
