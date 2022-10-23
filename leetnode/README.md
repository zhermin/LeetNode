# The LeetNode Website

This folder houses all frontend and backend code for the LeetNode website. This is built with the T3-Stack but with React Query and REST APIs instead of tRPC for the frontend-backend communication.

The T3-Stack:

- [Next.js](https://nextjs.org/)
- [Next-Auth.js](https://next-auth.js.org)
- [TailwindCSS](https://tailwindcss.com)
- [Prisma](https://prisma.io)
- ~~[tRPC](https://trpc.io)~~ [React Query](https://tanstack.com/query/v4)

## Setup

Always perform these steps to get the most recent changes and install any new dependencies:

```bash
git pull
cd leetnode
npm install
```

Run Dev on `localhost:3000` (try to keep this port clear as dev configs are using this port)

```bash
npm run dev
```

Prisma Schema Changes (to non-production branches); PlanetScale `main` branch connected on `port=3309`

```bash
npm run pscale  # script: pscale connect leetnode main --port 3309

# Open New Terminal

npx prisma db push
npx prisma db seed  # initialize db with seed data
```

Prisma Studio Script (interactively view database)

```bash
npm run studio
```
