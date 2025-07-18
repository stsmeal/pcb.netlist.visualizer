import expressjwt from 'express-jwt';
import { config } from '../../config';

export function jwt() {
  const secret = config.secret;

  return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  });
}

async function isRevoked(_req, _payload, done) {
  // Call done with null (no error) and false (token is not revoked)
  done(null, false);
}
