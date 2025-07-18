import { BaseHttpController } from 'inversify-express-utils';

export class BaseController extends BaseHttpController {
  protected override badRequest(message?: unknown) {
    const res = { message: message };
    return super.badRequest(JSON.stringify(res));
  }
}
