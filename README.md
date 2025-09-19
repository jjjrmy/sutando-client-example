# Nuxt App with Sutando Client / Server Example, Better Auth, and Capacitor

This is a simple example of how to use Sutando with a Nuxt.js client and a Node.js server OR Cloudflare Pages [NOT WORKERS].

## Note

Right now there isn't a good way to run the migrations ... but that is a TODO.

## Local Development

1. Run `npm install`
2. Run `npm run dev` or `npm run dev:https`

## Local Mobile Development

1. Run `npm run build:ios`
2. Run `npm run dev:ios`

## Deploy to Cloudflare Pages

1. add your `.env` variables to the `secrets.json` file
2. Run `npm run build:pages`
3. Run `npm run secrets:pages`
4. Run `npm run deploy:pages`
