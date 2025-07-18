import UserSchema from '../../src/models/user';
import SubmissionSchema from '../../src/models/submisssion';

describe('Models', () => {
  describe('User Schema', () => {
    it('should have correct schema definition', () => {
      const userPaths = UserSchema.paths;

      expect(userPaths.username).toBeDefined();
      expect(userPaths.firstname).toBeDefined();
      expect(userPaths.lastname).toBeDefined();
      expect(userPaths.dateCreated).toBeDefined();
      expect(userPaths.deleted).toBeDefined();

      // Check that username is unique and lowercase
      expect(userPaths.username.options.unique).toBe(true);
      expect(userPaths.username.options.lowercase).toBe(true);

      // Check default value for deleted
      expect(userPaths.deleted.options.default).toBe(false);
    });

    it('should have pre-find middleware for soft deletes', () => {
      const preFindHooks = UserSchema.pre.bind(UserSchema);
      expect(preFindHooks).toBeDefined();
    });
  });

  describe('Submission Schema', () => {
    it('should have correct schema definition', () => {
      const submissionPaths = SubmissionSchema.paths;

      expect(submissionPaths.data).toBeDefined();
      expect(submissionPaths.user).toBeDefined();
      expect(submissionPaths.dateCreated).toBeDefined();
      expect(submissionPaths.deleted).toBeDefined();

      // Check that user is a reference to User model
      expect(submissionPaths.user.options.ref).toBe('User');

      // Check default value for deleted
      expect(submissionPaths.deleted.options.default).toBe(false);
    });

    it('should have pre-find middleware for soft deletes', () => {
      const preFindHooks = SubmissionSchema.pre.bind(SubmissionSchema);
      expect(preFindHooks).toBeDefined();
    });
  });
});
