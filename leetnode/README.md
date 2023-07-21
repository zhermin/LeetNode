# The LeetNode Website

This folder houses all frontend and backend code for the LeetNode website. This is built with the [T3-Stack](https://create.t3.gg/) but with React Query and REST APIs instead of tRPC for the frontend-backend communication. The full tech stack can be found in the main README of this [repo](https://github.com/zhermin/LeetNode).

## Setup

### Package Management

For the node package manager, `pnpm` is used instead of `npm`, due to several benefits. The syntax, however, is quite similar to `npm`. You can learn more about `pnpm` in their [documentation](https://pnpm.io/).

The main difference is in the adding and removing of packages, `pnpm add -` instead of `npm install -` and `pnpm remove -` instead of `npm uninstall -` respectively.

### Project Cloning

First clone this project. If you are solely working on the website, you may also want to open the project in this folder instead of the root folder as the relative paths might sometimes be confused.

```bash
git clone https://github.com/zhermin/LeetNode.git
cd LeetNode  # root folder of this repo

cd leetnode  # subfolder for the website only
code .  # opens the /leetnode subfolder in vscode
```

### Dependencies

Always perform these steps to get the most recent changes and install any new project dependencies:

```bash
git pull
cd leetnode  # make sure you are in the /leetnode subfolder
pnpm install
```

For a fresh setup, the hosting solutions used will also have to be initialized, so make sure that accounts are set up in these platforms (all have free tiers as of 2023), namely:

- Vercel: Website Hosting
- PlanetScale: MySQL Database Hosting
- Cloudinary: Media Hosting

### Environment Variables

Make sure to copy the `.env.example` file and create a new `.env` local file with the environment variables filled in such as the API keys and secrets. They mostly allow backend services such as the databases and cron jobs to work properly.

If you are deploying on Vercel, make sure to fill them in Vercel's environment variables section in the dashboard as well.

### Run Website Locally (Terminal 1)

```bash
pnpm run dev
```

The website will be accessible on [`localhost:3000`](localhost:3000) (try to keep this port clear).

### Run Database Locally (Terminal 2)

Ensure that you have a database set up. We used PlanetScale, which offers a free MySQL database. Find out how to connect to your database, install the necessary libraries, and start a new terminal to run a local database server.

```bash
pscale auth login
pscale connect my-planetscale-database-name my-branch-name

# example
pscale connect leetnode main  # or: pnpm pscale
```

Starts a connection to your local or hosted database on port `3306`.

### Schema Changes (Terminal 3)

Prisma, an ORM, is used to easily manage the database including schema changes. An initial seed file to quickly populate the database can also be used.

Assumes schema changes are made to non-protected branches and a database connection to the database on `port=3306` has been started.

```bash
pnpm prisma db push  # push schema changes to the database
pnpm prisma db seed  # initialize database with seed data
```

### Interactive Database Management (Terminal 4)

Prisma comes with a feature called `Studio` that allows you to view and manipulate the data in your database easily. Again, make sure the database connection has been established first.

```bash
pnpm prisma studio  # or: pnpm studio
```

This `Studio` will then be accessible on [`localhost:5555`](localhost:5555).
