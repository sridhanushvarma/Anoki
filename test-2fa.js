const speakeasy = require('speakeasy');

// Secret from the 2FA setup response
const secret = 'EREWIPB3IR3CMLZZORXGMSR4I5NGILTSIZFCYM3LGE5DYPSOIZMA';

// Generate TOTP token
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Generated TOTP token:', token);
