# The LeetNode Website

This folder houses all frontend and backend code for the LeetNode website. This is built with the [T3-Stack](https://create.t3.gg/) but with React Query and REST APIs instead of tRPC for the frontend-backend communication. The full tech stack can be found in the main README of this [repo](https://github.com/zhermin/LeetNode).

## Environment Variables

Make sure to copy the `.env.example` file and create a new `.env` local file with the environment variables filled in. They are necessary for the backend services such as the databases and cron jobs to work properly.

If you are deploying on Vercel, remember to always replicate them in Vercel's environment variables section in the dashboard as well.

**IMPORTANT:** Always ensure you have the most updated `.env` file from your team and place it in the `/LeetNode/leetnode` subfolder.

## Docker Setup (Recommended)

Using Docker to run the app while still developing on your own host machine is recommended because everyone on the team will be in the same environment with the same tools, although installing the dependencies and starting the app on your own machine works as well.

Note that using Docker to develop means you cannot use the PlanetScale CLI and Prisma Studio to manage your database and interactively view and edit your database's data. So it is up to personal and team preferences.

Start by installing Docker on your machine. The commands below are for Ubuntu / WSL machines from this [link](https://docs.docker.com/engine/install/ubuntu/).

### Set Up Repository

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Install Docker and Allow Non-Root User Access

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo groupadd -f docker && sudo usermod -aG docker $USER && newgrp docker

# Verify Installation
docker run hello-world
```

### Start our `nextjs-dev` Docker Container

```bash
docker run --profile dev up --build --force-recreate
```

The website will then be accessible on [`localhost:3000`](localhost:3000) (try to keep this port clear).

## Local Setup

The instructions below outline how you can set up the necessary tools for local development on your own machine without Docker. You may want to just install the node modules by stopping at step 3, so that your VSCode or IDE can do proper syntax checks and auto-completion while still running the app in the `nextjs-dev` Docker container.

If you are using Windows, it is highly recommended to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/) to have a Linux system for local dev due to ease of package installations. Install it through [Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install).

### 1. Project Cloning

First, git clone this project onto your machine. Then, when you are working on the app itself, open the project in this `/LeetNode/leetnode` subfolder instead of the `/LeetNode` root folder as the relative paths might break.

```bash
git clone https://github.com/zhermin/LeetNode.git
cd LeetNode  # root folder of this repo

cd leetnode  # subfolder for the website only
code .  # opens the /leetnode subfolder in VSCode
```

### 2. Package Management

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

### 3. Dependencies

Always perform these steps to get the most recent changes and install any new project dependencies:

```bash
git pull
cd leetnode  # make sure you are in the /Leetnode/leetnode subfolder
pnpm install
```

### 4. Run Website Locally (Terminal 1)

```bash
pnpm run dev
```

The website will then be accessible on [`localhost:3000`](localhost:3000) (try to keep this port clear).

### 5. Run Database Locally (Terminal 2)

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
pscale connect leetnode main  # or: pnpm pscale
```

This starts a connection to your PlanetScale database on port `3306`.

### 6. Schema Changes (Terminal 3)

Prisma, an ORM, is used to easily manage the database including schema changes. An initial seed file to quickly populate the database can also be used.

Assumes schema changes are made to non-protected branches and a database connection to the database on `port=3306` has been started.

```bash
pnpm prisma db push  # push schema changes directly (only non-protected branches)
pnpm prisma db seed  # initialize database with seed data
```

### 7. Interactive Database Management (Terminal 4)

Prisma comes with a feature called `Studio` that allows you to view and manipulate the data in your database easily. Again, make sure the database connection has been established first.

```bash
pnpm prisma studio  # or: pnpm studio
```

This `Studio` will then be accessible on [`localhost:5555`](localhost:5555).
