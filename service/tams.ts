import { TamsSDK, Sha256RsaAuthenticateStrategy } from 'tams-sdk'

const privateKey = Buffer.from(
  process.env.TAMS_PRIVATE_KEY ?? '',
  'base64',
).toString('ascii')

export const tamsSDK = new TamsSDK({
  appId: 'rA0R2ywjw',
  authenticateStrategy: new Sha256RsaAuthenticateStrategy(privateKey),
})
