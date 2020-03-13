import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class HistoryMiddleWare implements NestMiddleware {
  constructor(private authService: AuthService) {}
  use(req: Request, res: Response, next: Function) {
    req.query.returnTo
      ? this.authService.setReturnUrl(req.query.returnTo)
      : this.authService.setReturnUrl('');
    next();
  }
}
