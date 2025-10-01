# Tiny AI Tutor

A small tutor chat bot, powered by generative AI.

## Quick Start

### Prerequisites

You will need:

1. An OpenAI API key.

2. A moderately recent version of Node.js. (Tested with the current and previous LTS releases: v22 and v20.)

3. A remotely recent version of Docker. Tested with the v20 engine.

All other external dependencies can installed automatically.

### Build and Launch

1. Run `cp .env.example .env` to copy  [`.env.example`](./.env.example) to `.env` (in the repository root directory).

2. Edit the `.env` file to set `OPENAI_KEY`.

3. Run `make run` to install, build and launch the cluster of services. (Or see the [manual build instructions](#manual-build-instructions) below.)

4. Visit <http://localhost:8080> (or whatever value you set `HOST_PORT` to in `.env`) to access the site.

#### Troubleshooting

If you run into any issues with `make run` in step #3 above, you can try:

  * `make clean install build run` to force the build sequence relying on make's dependency resolution magic

  * `make clean-more reinstall` - the "nuclear option", which wipes out all installed dependencies and lockfiles to force a clean install. (Follow this with either of the above.)

#### Manual Build Instructions

A [`Makefile`](./Makefile) is provided for your convenience, but you can also build and launch the service manually, as follows:

```bash
(cd client && npm install)
(cd server && npm install)
(docker compose up --build)
```

You can also run the service directly on the host platform (without relying on `docker` or `docker compose`).

See the scripts defined in [`./client/package.json`](./client/package.json) and [`./server/package.json`](./server/package.json) for details.
