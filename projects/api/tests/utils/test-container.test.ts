import { TestContainer, createTestUser } from '../utils/test-container';
import { TYPES } from '../../src/constants/types';
import { AuthService } from '../../src/services/auth.service';

describe('TestContainer', () => {
  it('should create and provide services', () => {
    const testContainer = new TestContainer();
    const authService = testContainer.get<AuthService>(TYPES.AuthService);

    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should create test user data', () => {
    const userData = createTestUser();

    expect(userData).toEqual({
      username: 'testuser',
      firstname: 'Test',
      lastname: 'User',
    });
  });
});
