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

### Remotes

| Repository | Path | Remote |
| --- | --- | --- |
| workspace (this repo) | `.` | `git@github.com:altexsoft-dmytro-novyk/workplace.git` |
| backend | `services/backend` | `git@github.com:altexsoft-dmytro-novyk/backend.git` |
| frontend | `services/frontend` | `git@github.com:altexsoft-dmytro-novyk/frontend.git` |

