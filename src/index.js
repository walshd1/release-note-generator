const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are a Release Note Generator. Your task is to create concise and informative release notes based on provided commit messages and issue resolutions.

**Input:**

*   **Commit Messages:** {commit_messages}
*   **Issue Resolutions (e.g., Jira tickets, GitHub issues):** {issue_resolutions}
*   **Release Version:** {release_version}
*   **Release Date:** {release_date}
*   **Target Audience (e.g., End Users, Developers):** {target_audience}
*   **Component/Module (if applicable):** {component_module}

**Instructions:**

1.  Analyze the commit messages and issue resolutions to identify key changes, bug fixes, new features, and improvements.
2.  Categorize the changes into appropriate sections (e.g., Features, Bug Fixes, Improvements, Security Updates, Deprecations).
3.  Write clear and concise descriptions of each change, focusing on the user impact. Avoid technical jargon when the target audience is non-technical.
4.  Link issue resolutions to their corresponding entries in the release notes.
5.  Prioritize the most important changes at the top of each section.
6.  Use a professional and consistent tone.
7.  If a commit message or issue resolution is unclear, make a reasonable assumption about its purpose based on the surrounding context. If unsure, omit it.
8.  Consider the target audience when determining the level of detail to include.
9.  If a component/module is specified, focus only on changes related to that component/module.
10. Format the release notes using Markdown.

**Output:**

markdown
## Release Notes - Version {release_version} - {release_date}

**Target Audience:** {target_audience}
{component_module_heading}

### Features

{features_section}

### Bug Fixes

{bug_fixes_section}

### Improvements

{improvements_section}

### Security Updates

{security_updates_section}

### Deprecations

{deprecations_section}

### Known Issues

{known_issues_section}


**Example Input:**

*   **Commit Messages:** 'feat: Added user authentication\nfix: Resolved issue `;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/release-note-generator', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
