# tams gen qrcode example

This is an example for demonstrating how to use TAMS SDK. We have leveraged the capabilities of the TAMS SDK to create an Web App that can generate QR codes based on prompts.

![screenshot](screenshot.jpeg)

You can visit this [website](https://tams-gen-qrcode-example-git-main-zhuscat.vercel.app/) to see the demo.

## Environment Variables

#### `TAMS_PRIVATE_KEY` (required)

Your TAMS private key after base64 encoding. You can manage your TAMS private key on [Tensor Art Model Serivce](https://tams.tensor.art).

After downloading the private key on your local machine, you can generate the base64 encoding key by following command:

```
cat ./YOUR_PRIVATE_KEY_PATH | base64
```

#### `UPSTASH_REDIS_REST_URL` (required)

Your Upstash Redis REST URL. You can get it from [upstash](https://upstash.com/)

#### `UPSTASH_REDIS_REST_TOKEN`(required)

Your Upstash Redis REST Token. You can get it from [upstash](https://upstash.com/)

## Development

Before you `npm run dev`, you should create a `.env.local` file containing `TAMS_PRIVATE_KEY`, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

```
$ git clone git@github.com:Tensor-Art/tams-gen-qrcode-example.git
$ cd tams-gen-qrcode-example
$ npm install
$ npm run dev
```

## Deploy

### Deploy on Vercel

You can deploy your own instance by clicking deploy button [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTensor-Art%2Ftams-gen-qrcode-example&env=TAMS_PRIVATE_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN)
