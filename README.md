# Release Note Generator

> A GitHub Action that uses AI to automatically generate polished, Markdown-formatted release notes from your commit messages, issue resolutions, and project metadata.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Release%20Note%20Generator-blue?logo=github)](https://github.com/marketplace/actions/release-note-generator)

---

## How It Works

When the action runs, it:

1. Collects context from the GitHub environment — repository name, event name, and fields from your `package.json` (e.g. `version`, `name`).
2. Builds a detailed prompt from that context and sends it to an AI model (Google Gemini 2.0 Flash).
3. Returns the AI-generated release notes as a step output (`result`) and prints them to the workflow log.

The generated notes are structured Markdown with the following sections:

- **Features** — new functionality
- **Bug Fixes** — resolved issues
- **Improvements** — enhancements to existing behaviour
- **Security Updates** — security-related changes
- **Deprecations** — removed or soon-to-be-removed features
- **Known Issues** — outstanding problems

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `gemini_api_key` | One of these two is required | Your [Google Gemini API key](https://aistudio.google.com/app/apikey). Free to obtain; usage billed by Google. |
| `service_token` | One of these two is required | An Action Factory service token. No Google account needed; billed at AI cost + 4.75%. |

Provide exactly one of the two inputs. If neither is supplied the action will fail with an error.

---

## Outputs

| Output | Description |
|---|---|
| `result` | The AI-generated release notes as a Markdown string. |

---

## Usage

### Option A — Free (bring your own Gemini API key)

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it as a repository secret named `GEMINI_API_KEY`.
3. Reference the action in your workflow:

```yaml
- uses: walshd1/release-note-generator@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

### Option B — Paid (Action Factory token)

1. Obtain a service token from [Action Factory](https://action-factory.walshd1.workers.dev).
2. Add it as a repository secret named `ACTION_FACTORY_TOKEN`.
3. Reference the action in your workflow:

```yaml
- uses: walshd1/release-note-generator@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```

---

## Full Workflow Example

The example below generates release notes whenever a new GitHub Release is published, then writes them back to the release body.

```yaml
name: Generate Release Notes

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate release notes
        id: notes
        uses: walshd1/release-note-generator@v1
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}

      - name: Update release body
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: context.payload.release.id,
              body: `${{ steps.notes.outputs.result }}`
            });
```

You can also trigger the action on a `push` to your main branch, on a schedule, or manually via `workflow_dispatch`.

---

## Tips

- **`package.json` version**: The action reads `version` from your `package.json` and uses it as the release version in the generated notes. Keep it up to date before tagging a release.
- **Commit message conventions**: Using [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`) gives the AI clearer signals and produces better-categorised notes.
- **Target audience**: The AI infers audience from context. For end-user-facing notes, keep commit messages focused on user impact rather than implementation details.

---

## Building Locally

```bash
npm install
npm run build   # outputs dist/index.js via @vercel/ncc
```

The `dist/` directory is committed automatically by the CI workflow on every push.
