# workspace

This workspace repository ties together the `services/backend` and `services/frontend` projects as git submodules.

## Getting started

Clone the workspace and its submodules in one step:

```
git clone --recurse-submodules git@github.com:altexsoft-dmytro-novyk/workplace.git
cd workplace
```

If you already cloned without `--recurse-submodules`, initialize them afterwards:

```
npm run services:init
```

### Service submodule scripts

| Script | Description |
| --- | --- |
| `npm run services:init` | Initialize and clone submodules (`git submodule update --init --recursive`) |
| `npm run services:status` | Show submodule status (`git submodule status`) |
| `npm run services:sync` | Update submodules to their remote branch tip (`git submodule update --remote`) |
| `npm run services:install` | Install dependencies for both services (`npm install` in `services/backend` and `services/frontend`) |
| `npm run services:build` | Build both services |
| `npm run services:lint` | Lint both services |
| `npm run services:test` | Run tests for both services |
| `npm run services:db:up` | Start the backend's Postgres container (`docker compose up -d` in `services/backend`) |
| `npm run services:db:down` | Stop the backend's Postgres container |
| `npm run services:dev:backend` | Run only the backend dev server (port 3001) |
| `npm run services:dev:frontend` | Run only the frontend dev server (port 4200) |


### Running both services

To run the backend and frontend together, open two terminal tabs (or windows):

**Terminal 1** — install dependencies, start the database, and run the backend:

```
npm run services:install && npm run services:db:up && npm run services:dev:backend
```

**Terminal 2** — run the frontend:

```
npm run services:dev:frontend
```



### Remotes

| Repository | Path | Remote |
| --- | --- | --- |
| workspace (this repo) | `.` | `git@github.com:altexsoft-dmytro-novyk/workplace.git` |
| backend | `services/backend` | `git@github.com:altexsoft-dmytro-novyk/backend.git` |
| frontend | `services/frontend` | `git@github.com:altexsoft-dmytro-novyk/frontend.git` |

