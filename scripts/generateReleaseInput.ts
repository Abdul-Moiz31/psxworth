import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

type CliOptions = {
  from: string;
  to: string;
  output?: string;
  useGh: 'auto' | 'on' | 'off';
};

type CommitInfo = {
  sha: string;
  shortSha: string;
  subject: string;
  body: string;
  author: string;
  date: string;
  files: string[];
  prNumbers: number[];
};

type PrInfo = {
  number: number;
  title: string;
  body: string;
  url: string;
  author: string;
};

function run(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function runSafe(cmd: string): string | null {
  try {
    return run(cmd);
  } catch {
    return null;
  }
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    from: 'origin/main',
    to: 'origin/develop',
    useGh: 'auto',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--from') {
      options.from = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--to') {
      options.to = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--output') {
      options.output = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--with-gh') {
      options.useGh = 'on';
      continue;
    }
    if (arg === '--no-gh') {
      options.useGh = 'off';
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  if (!options.from || !options.to) {
    throw new Error('Both --from and --to values are required when set.');
  }

  return options;
}

function printHelp(): void {
  console.log(`Generate release input markdown from git history.

Usage:
  pnpm release:input [--from <ref>] [--to <ref>] [--output <file>] [--with-gh|--no-gh]

Defaults:
  --from origin/main
  --to origin/develop
  --output release-notes/release-input-YYYY-MM-DD.md

Behavior:
  - Includes commits in from..to
  - Excludes merge commits
  - Excludes docs-only commits
  - Optionally enriches PRs using gh CLI when available/authenticated
`);
}

function getDefaultOutputPath(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `release-notes/release-input-${yyyy}-${mm}-${dd}.md`;
}

function ensureGitRefExists(ref: string): void {
  const ok = runSafe(`git rev-parse --verify ${shellEscape(ref)}`);
  if (!ok) {
    throw new Error(`Git ref not found: ${ref}`);
  }
}

function isDocsOnlyPath(file: string): boolean {
  if (!file) {
    return true;
  }

  const lower = file.toLowerCase();

  if (lower.startsWith('docs/')) {
    return true;
  }
  if (lower.startsWith('.github/')) {
    return true;
  }

  const name = basename(lower);
  if (name === 'readme.md' || name === 'readme' || name.startsWith('readme.')) {
    return true;
  }

  const docsExts = ['.md', '.mdx', '.txt', '.rst'];
  return docsExts.some((ext) => lower.endsWith(ext));
}

function extractPrNumbers(text: string): number[] {
  const matches = text.match(/#(\d+)/g) ?? [];
  const nums = matches
    .map((m) => Number.parseInt(m.slice(1), 10))
    .filter((n) => Number.isInteger(n) && n > 0);
  return Array.from(new Set(nums));
}

function readCommit(sha: string): CommitInfo {
  const format = ['%s', '%b', '%an', '%ad'].join('%x1f');
  const raw = run(`git show --no-patch --format=${shellEscape(format)} --date=iso ${shellEscape(sha)}`);
  const [subject = '', body = '', author = '', date = ''] = raw.split('\u001f');

  const filesRaw = runSafe(`git show --pretty='' --name-only ${shellEscape(sha)}`) ?? '';
  const files = filesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const prNumbers = extractPrNumbers(`${subject}\n${body}`);

  return {
    sha,
    shortSha: sha.slice(0, 8),
    subject: subject.trim(),
    body: body.trim(),
    author: author.trim(),
    date: date.trim(),
    files,
    prNumbers,
  };
}

function getRepoSlug(): string | null {
  const remote = runSafe('git config --get remote.origin.url');
  if (!remote) {
    return null;
  }

  const sshMatch = remote.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`;
  }

  return null;
}

function canUseGh(mode: 'auto' | 'on' | 'off'): { enabled: boolean; reason: string } {
  if (mode === 'off') {
    return { enabled: false, reason: 'disabled by --no-gh' };
  }

  const hasGh = runSafe('command -v gh');
  if (!hasGh) {
    return { enabled: false, reason: 'gh CLI not installed' };
  }

  const authOk = runSafe('gh auth status >/dev/null 2>&1; echo $?');
  if (authOk !== '0') {
    if (mode === 'on') {
      return { enabled: false, reason: 'gh CLI not authenticated' };
    }
    return { enabled: false, reason: 'gh CLI not authenticated (auto mode)' };
  }

  return { enabled: true, reason: 'gh CLI available and authenticated' };
}

function fetchPrInfo(prNumber: number, repoSlug: string): PrInfo | null {
  const json = runSafe(`gh pr view ${prNumber} -R ${shellEscape(repoSlug)} --json number,title,body,url,author`);
  if (!json) {
    return null;
  }

  try {
    const parsed = JSON.parse(json) as {
      number: number;
      title: string;
      body: string;
      url: string;
      author?: { login?: string };
    };

    return {
      number: parsed.number,
      title: parsed.title ?? '',
      body: (parsed.body ?? '').trim(),
      url: parsed.url ?? '',
      author: parsed.author?.login ?? 'unknown',
    };
  } catch {
    return null;
  }
}

function makeMarkdown(params: {
  from: string;
  to: string;
  generatedAt: string;
  included: CommitInfo[];
  skippedDocsOnly: CommitInfo[];
  ghStatus: { enabled: boolean; reason: string };
  prs: PrInfo[];
  repoSlug: string | null;
}): string {
  const { from, to, generatedAt, included, skippedDocsOnly, ghStatus, prs, repoSlug } = params;
  const lines: string[] = [];

  lines.push('# Release Input');
  lines.push('');
  lines.push('## Metadata');
  lines.push(`- Generated at: ${generatedAt}`);
  lines.push(`- Compare range: ${from}..${to}`);
  lines.push(`- Repo: ${repoSlug ?? 'unknown'}`);
  lines.push(`- GitHub PR enrichment: ${ghStatus.enabled ? `enabled (${ghStatus.reason})` : `skipped (${ghStatus.reason})`}`);
  lines.push('');

  lines.push('## Summary');
  lines.push(`- Included commits: ${included.length}`);
  lines.push(`- Docs-only commits excluded: ${skippedDocsOnly.length}`);
  lines.push(`- PRs detected: ${new Set(included.flatMap((c) => c.prNumbers)).size}`);
  lines.push(`- PRs enriched: ${prs.length}`);
  lines.push('');

  lines.push('## Included Commits');
  lines.push('');
  if (included.length === 0) {
    lines.push('_No non-doc commits found in this range._');
  } else {
    for (const commit of included) {
      lines.push(`### ${commit.subject || '(no subject)'} (${commit.shortSha})`);
      lines.push(`- Author: ${commit.author || 'unknown'}`);
      lines.push(`- Date: ${commit.date || 'unknown'}`);
      lines.push(`- SHA: ${commit.sha}`);
      lines.push(`- PR references: ${commit.prNumbers.length > 0 ? commit.prNumbers.map((n) => `#${n}`).join(', ') : 'none detected'}`);

      if (commit.body) {
        lines.push('- Commit body:');
        lines.push('```text');
        lines.push(commit.body);
        lines.push('```');
      }

      lines.push('- Changed files:');
      for (const file of commit.files) {
        lines.push(`  - ${file}`);
      }
      lines.push('');
    }
  }

  lines.push('## Docs-only Commits Excluded');
  lines.push('');
  if (skippedDocsOnly.length === 0) {
    lines.push('_None._');
  } else {
    for (const commit of skippedDocsOnly) {
      lines.push(`- ${commit.shortSha} ${commit.subject || '(no subject)'}`);
    }
  }
  lines.push('');

  lines.push('## PR Details');
  lines.push('');
  if (prs.length === 0) {
    lines.push('_No PR details available._');
  } else {
    for (const pr of prs) {
      lines.push(`### #${pr.number} ${pr.title || '(no title)'}`);
      lines.push(`- URL: ${pr.url || 'N/A'}`);
      lines.push(`- Author: ${pr.author}`);
      if (pr.body) {
        lines.push('- PR description:');
        lines.push('```text');
        lines.push(pr.body);
        lines.push('```');
      } else {
        lines.push('- PR description: (empty)');
      }
      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  ensureGitRefExists(opts.from);
  ensureGitRefExists(opts.to);

  const range = `${opts.from}..${opts.to}`;
  const shaListRaw = runSafe(`git rev-list --no-merges ${shellEscape(range)}`) ?? '';
  const shas = shaListRaw.split('\n').map((s) => s.trim()).filter(Boolean);

  const included: CommitInfo[] = [];
  const skippedDocsOnly: CommitInfo[] = [];

  for (const sha of shas) {
    const commit = readCommit(sha);
    const nonEmptyFiles = commit.files.filter(Boolean);

    if (nonEmptyFiles.length > 0 && nonEmptyFiles.every((f) => isDocsOnlyPath(f))) {
      skippedDocsOnly.push(commit);
      continue;
    }

    included.push(commit);
  }

  const prNumbers = Array.from(new Set(included.flatMap((c) => c.prNumbers))).sort((a, b) => a - b);

  const ghStatus = canUseGh(opts.useGh);
  const repoSlug = getRepoSlug();

  const prs: PrInfo[] = [];
  if (ghStatus.enabled && repoSlug) {
    for (const prNumber of prNumbers) {
      const pr = fetchPrInfo(prNumber, repoSlug);
      if (pr) {
        prs.push(pr);
      }
    }
  }

  const outputPath = opts.output ?? getDefaultOutputPath();
  const outputDir = outputPath.includes('/') ? outputPath.slice(0, outputPath.lastIndexOf('/')) : '.';

  if (outputDir && outputDir !== '.' && !existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const generatedAt = new Date().toISOString();
  const markdown = makeMarkdown({
    from: opts.from,
    to: opts.to,
    generatedAt,
    included,
    skippedDocsOnly,
    ghStatus,
    prs,
    repoSlug,
  });

  writeFileSync(outputPath, markdown, 'utf8');

  console.log(`Wrote release input: ${outputPath}`);
  console.log(`Included commits: ${included.length}`);
  console.log(`Docs-only commits excluded: ${skippedDocsOnly.length}`);
  console.log(`PRs detected: ${prNumbers.length}`);
  console.log(`PRs enriched: ${prs.length}`);
  console.log(`GitHub enrichment: ${ghStatus.enabled ? 'enabled' : `skipped (${ghStatus.reason})`}`);
}

main();
