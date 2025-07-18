import { Container } from 'inversify';
import { TYPES } from '../../src/constants/types';
import { Context } from '../../src/context/context';
import { AuthService } from '../../src/services/auth.service';
import { UserService } from '../../src/services/user.service';
import { SubmissionService } from '../../src/services/submission.service';

export class TestContainer {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.setupBindings();
  }

  private setupBindings() {
    // Mock Context binding - we'll use a mock instead of the real database connection
    this.container
      .bind<Context>(TYPES.Context)
      .toDynamicValue(() => {
        const mockContext = {
          users: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
          userIdentities: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
          loginAudits: {
            create: jest.fn().mockReturnValue({
              then: jest.fn().mockReturnThis(),
              catch: jest.fn(),
            }),
          },
          submissions: {
            find: jest.fn(),
            create: jest.fn(),
          },
        };
        return mockContext as any;
      })
      .inSingletonScope();

    // Service bindings
    this.container.bind<AuthService>(TYPES.AuthService).to(AuthService);
    this.container.bind<UserService>(TYPES.UserService).to(UserService);
    this.container
      .bind<SubmissionService>(TYPES.SubmissionService)
      .to(SubmissionService);
  }

  public get<T>(serviceIdentifier: any): T {
    return this.container.get<T>(serviceIdentifier);
  }

  public getContainer(): Container {
    return this.container;
  }
}

export const createTestUser = () => ({
  username: 'testuser',
  firstname: 'Test',
  lastname: 'User',
});

export const createTestSubmission = (userId: string) => ({
  data: 'test netlist data',
  user: userId,
  dateCreated: new Date(),
  deleted: false,
});
