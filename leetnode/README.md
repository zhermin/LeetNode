# The LeetNode Website

This folder houses all frontend and backend code for the LeetNode website. This is built with the [T3-Stack](https://create.t3.gg/) but with React Query and REST APIs instead of tRPC for the frontend-backend communication. The full tech stack can be found in the main README of this [repo](https://github.com/zhermin/LeetNode).

## Environment Variables

**IMPORTANT:** Always ensure you have the most updated `.env` file from your team and place it in this `/LeetNode/leetnode` subfolder.

## Docker Setup (Recommended)

Follow the steps in the [root folder](../) to start all 3 Docker containers (Nginx, NextJS and Recommender) with the dev profile on [`http://localhost`](http://localhost).

```bash
docker compose --profile dev up --build --force-recreate
```

## Local Setup

The instructions below outline how you can set up the necessary tools for local development on your own machine without Docker. You may want to just install the node modules by stopping at step 3, so that your VSCode or IDE can do proper syntax checks and auto-completion while still running the app in the `nextjs-dev` Docker container.

If you are using Windows, it is highly recommended to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/) to have a Linux system for local dev due to ease of package installations. Install it through [Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install).

### 1. Package Management

For the node package manager, `pnpm` is used instead of `npm`, due to several benefits. The syntax, however, is quite similar to `npm`. You can learn more about `pnpm` in their [documentation](https://pnpm.io/).

The main difference is in the adding and removing of packages, `pnpm add -` instead of `npm install -` and `pnpm remove -` instead of `npm uninstall -` respectively.

Install it by first making sure you have `node` on your system. This app was developed on `node 18`, so install that to ensure parity.

```bash
# Ubuntu (Linux / WSL)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Installation
node -v
```

Then install pnpm globally.

```bash
npm install -g pnpm@7.23.0
```

### 2. Dependencies

Always perform these steps to get the most recent changes and install any new project dependencies:

```bash
git pull
cd leetnode  # make sure you are in the /Leetnode/leetnode subfolder
pnpm install
```

### 3. Run Website Locally (Terminal 1)

```bash
pnpm run dev
```

The website will then be accessible on [`http://localhost:3000`](http://localhost:3000) (try to keep this port clear).

### 4. Run Database Locally (Terminal 2)

If you want to play with your own dummy, non-production data, ensure that you an account and have a database set up. We use PlanetScale (pscale), which offers a free MySQL database.

If you want to perform migrations and schema changes easily using the command-line, you should do it through their PlanetScale CLI, which you can install with this [link](https://github.com/planetscale/cli#installation).

```bash
# Install PlanetScale CLI v0.150.0 for Linux, other versions available in their GitHub releases page
wget https://github.com/planetscale/cli/releases/download/v0.150.0/pscale_0.150.0_linux_386.deb
sudo dpkg -i pscale_0.150.0_linux_386.deb
rm pscale_0.150.0_linux_386.deb

# Verify Installation
pscale --version

# Login to your PlanetScale account
pscale auth login
pscale connect <my-planetscale-database-name> <my-branch-name>

# Example: assuming your pscale db name is `leetnode` and pscale branch is `main`
pscale connect leetnode main  # or: $ pnpm pscale
```

This starts a connection to your PlanetScale database on port `3306`.

### 5. Schema Changes (Terminal 3)

Prisma, an ORM, is used to easily manage the database including schema changes. An initial seed file to quickly populate the database can also be used.

Assumes schema changes are made to non-protected branches and a database connection to the database on `port=3306` has been started.

```bash
pnpm prisma db push  # push schema changes directly (only non-protected branches)
pnpm prisma db seed  # initialize database with seed data
```

### 6. Interactive Database Management (Terminal 4)

Prisma comes with a feature called `Studio` that allows you to view and manipulate the data in your database easily. Again, make sure the database connection has been established first.

```bash
pnpm prisma studio  # or: $ pnpm studio
```

This `Studio` will then be accessible on [`http://localhost:5555`](http://localhost:5555).
