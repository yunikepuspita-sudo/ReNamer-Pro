# Open Notebook — local runner

Helper scripts to install and run [Open Notebook](https://github.com/lfnovo/open-notebook)
(an open-source, privacy-focused alternative to Google's NotebookLM) **from source**.

These scripts were written for a sandboxed remote environment where the normal
Docker install does not work, because:

- **Docker Hub** anonymous image pulls hit a rate limit.
- **api.github.com** and **install.surrealdb.com** return `403`.
- the frontend's lockfile resolved to **npmmirror.com**, which `403`s some packages.

So instead of Docker we run the four services directly:

| Service              | How                                   | Port |
| -------------------- | ------------------------------------- | ---- |
| SurrealDB v2         | binary from GitHub Releases           | 8000 |
| API (FastAPI)        | `uv run run_api.py`                   | 5055 |
| Background worker     | `surreal-commands-worker`             | —    |
| Frontend (Next.js)   | `npm run dev`                         | 3000 |

## Requirements

`git`, `curl`, `uv`, `node`/`npm`, `openssl` on the PATH. No Docker needed.

## Usage

```bash
tools/open-notebook/setup.sh   # one-time install (clone, deps, .env, DB binary)
tools/open-notebook/start.sh   # start all services
tools/open-notebook/stop.sh    # stop all services
```

Then open <http://localhost:3000>. API docs are at <http://localhost:5055/docs>.

By default everything lives under `~/open-notebook-run/` (source, DB data, logs).
Override with `ON_HOME=/some/path tools/open-notebook/setup.sh`.

## First-run configuration

On first start the API runs DB migrations automatically. You'll see warnings
about podcast profiles failing to migrate — that's expected: no AI provider key
is configured yet. Open the UI → **Settings → API Keys** and add a key
(OpenAI / Anthropic / Google / Groq) to enable chat, embeddings, and podcasts.

The encryption key that secures stored credentials is generated into
`~/open-notebook-run/src/.env` (`OPEN_NOTEBOOK_ENCRYPTION_KEY`). Keep it — if you
lose it, the API keys stored in the database can't be decrypted.

## Note on ephemeral environments

If you run these in a disposable cloud container, the app, its database, and the
generated encryption key live only inside that container and disappear when it is
reclaimed. These scripts (committed to the repo) are what survive — re-run
`setup.sh` + `start.sh` to rebuild. For a permanent install on your own machine,
prefer the upstream Docker Compose instructions, where Docker Hub is not blocked.
