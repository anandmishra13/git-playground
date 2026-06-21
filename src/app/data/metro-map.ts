export interface MetroStation {
  id: string;
  name: string;
  command: string;
  description: string;
  x: number;
  y: number;
  major: boolean;
  lineIds: string[];
  categoryIdx?: number;
  commandIdx?: number;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: string[];
}

export interface MetroTransfer {
  stationId: string;
  lines: string[];
}

export const METRO_LINES: MetroLine[] = [
  {
    id: 'setup',
    name: 'Setup & Config',
    color: '#e07a5f',
    stations: [
      'init', 'clone', 'config-user', 'config-email', 'config-editor',
      'config-alias', 'remote-add', 'remote-set-url', 'remote-rename',
      'remote-remove', 'remote-v', 'gitignore', 'gitattributes',
      'lfs-install', 'lfs-track',
    ],
  },
  {
    id: 'daily',
    name: 'Daily Workflow',
    color: '#5b8fb9',
    stations: [
      'status', 'diff', 'diff-staged', 'add', 'add-patch', 'add-interactive',
      'commit', 'commit-amend', 'commit-fixup', 'push', 'push-force',
      'push-tags', 'pull', 'pull-rebase', 'fetch', 'fetch-prune',
    ],
  },
  {
    id: 'branching',
    name: 'Branching & Merging',
    color: '#81b29a',
    stations: [
      'branch', 'branch-delete', 'branch-rename', 'switch', 'switch-create',
      'checkout', 'checkout-b', 'merge', 'merge-no-ff', 'merge-squash',
      'merge-abort', 'merge-conflicts', 'rebase', 'rebase-onto',
      'rebase-interactive', 'rebase-continue', 'rebase-abort',
      'cherry-pick', 'cherry-pick-no-commit',
    ],
  },
  {
    id: 'undo',
    name: 'Undo & Fix',
    color: '#9b8fb4',
    stations: [
      'restore', 'restore-staged', 'reset-soft', 'reset-mixed', 'reset-hard',
      'revert', 'revert-no-commit', 'commit-amend', 'stash', 'stash-pop',
      'stash-apply', 'stash-drop', 'stash-list', 'stash-branch',
      'clean', 'clean-dry', 'rm', 'rm-cached',
    ],
  },
  {
    id: 'inspect',
    name: 'Inspect & Debug',
    color: '#f2cc8f',
    stations: [
      'log', 'log-oneline', 'log-graph', 'log-author', 'log-since',
      'log-grep', 'log-s', 'show', 'diff', 'diff-stat',
      'blame', 'blame-l', 'bisect', 'bisect-good', 'bisect-bad',
      'bisect-reset', 'reflog', 'shortlog', 'whatchanged',
    ],
  },
  {
    id: 'collab',
    name: 'Collaboration',
    color: '#e63946',
    stations: [
      'clone', 'fork-workflow', 'fetch', 'pull', 'push',
      'remote-v', 'remote-add', 'upstream-sync', 'pull-request',
      'tag', 'tag-annotated', 'tag-push', 'tag-delete',
      'submodule-add', 'submodule-update', 'submodule-init',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    color: '#3d405b',
    stations: [
      'worktree-add', 'worktree-remove', 'worktree-list',
      'filter-branch', 'filter-repo', 'archive', 'bundle',
      'gc', 'fsck', 'prune', 'pack-refs',
      'notes', 'replace', 'rerere',
      'sparse-checkout', 'shallow-clone', 'grafts',
    ],
  },
];

export const METRO_STATIONS: MetroStation[] = buildStations();

function buildStations(): MetroStation[] {
  const raw: Record<string, { name: string; command: string; description: string; major: boolean }> = {
    // Setup & Config line
    'init': { name: 'git init', command: 'git init', description: 'Create a new repository', major: true },
    'clone': { name: 'git clone', command: 'git clone <url>', description: 'Copy a remote repository', major: true },
    'config-user': { name: 'config user', command: 'git config user.name "Name"', description: 'Set your identity name', major: true },
    'config-email': { name: 'config email', command: 'git config user.email "e@mail"', description: 'Set your identity email', major: false },
    'config-editor': { name: 'config editor', command: 'git config core.editor "code --wait"', description: 'Set default text editor', major: false },
    'config-alias': { name: 'config alias', command: 'git config alias.lg "log --oneline"', description: 'Create command shortcuts', major: false },
    'remote-add': { name: 'remote add', command: 'git remote add origin <url>', description: 'Connect to a remote repo', major: true },
    'remote-set-url': { name: 'remote set-url', command: 'git remote set-url origin <url>', description: 'Change remote URL', major: false },
    'remote-rename': { name: 'remote rename', command: 'git remote rename origin upstream', description: 'Rename a remote', major: false },
    'remote-remove': { name: 'remote remove', command: 'git remote remove <name>', description: 'Remove a remote connection', major: false },
    'remote-v': { name: 'remote -v', command: 'git remote -v', description: 'List all remotes', major: false },
    'gitignore': { name: '.gitignore', command: '.gitignore file', description: 'Ignore files from tracking', major: true },
    'gitattributes': { name: '.gitattributes', command: '.gitattributes file', description: 'File handling rules (line endings, etc)', major: false },
    'lfs-install': { name: 'lfs install', command: 'git lfs install', description: 'Enable Large File Storage', major: false },
    'lfs-track': { name: 'lfs track', command: 'git lfs track "*.psd"', description: 'Track large files with LFS', major: false },

    // Daily Workflow line
    'status': { name: 'git status', command: 'git status', description: 'See what changed', major: true },
    'diff': { name: 'git diff', command: 'git diff', description: 'Show unstaged changes', major: true },
    'diff-staged': { name: 'diff --staged', command: 'git diff --staged', description: 'Show staged changes', major: false },
    'add': { name: 'git add', command: 'git add <file>', description: 'Stage changes for commit', major: true },
    'add-patch': { name: 'add -p', command: 'git add -p', description: 'Stage changes interactively (hunks)', major: false },
    'add-interactive': { name: 'add -i', command: 'git add -i', description: 'Interactive staging mode', major: false },
    'commit': { name: 'git commit', command: 'git commit -m "message"', description: 'Save a snapshot', major: true },
    'commit-amend': { name: 'commit --amend', command: 'git commit --amend', description: 'Fix the last commit', major: true },
    'commit-fixup': { name: 'commit --fixup', command: 'git commit --fixup <sha>', description: 'Mark commit for auto-squash', major: false },
    'push': { name: 'git push', command: 'git push origin <branch>', description: 'Upload commits to remote', major: true },
    'push-force': { name: 'push --force-with-lease', command: 'git push --force-with-lease', description: 'Force push (safely)', major: false },
    'push-tags': { name: 'push --tags', command: 'git push --tags', description: 'Push all tags to remote', major: false },
    'pull': { name: 'git pull', command: 'git pull origin <branch>', description: 'Download and merge remote changes', major: true },
    'pull-rebase': { name: 'pull --rebase', command: 'git pull --rebase', description: 'Pull with rebase instead of merge', major: true },
    'fetch': { name: 'git fetch', command: 'git fetch origin', description: 'Download without merging', major: true },
    'fetch-prune': { name: 'fetch --prune', command: 'git fetch --prune', description: 'Clean up dead remote branches', major: false },

    // Branching & Merging line
    'branch': { name: 'git branch', command: 'git branch', description: 'List all branches', major: true },
    'branch-delete': { name: 'branch -d', command: 'git branch -d <name>', description: 'Delete a merged branch', major: false },
    'branch-rename': { name: 'branch -m', command: 'git branch -m <old> <new>', description: 'Rename a branch', major: false },
    'switch': { name: 'git switch', command: 'git switch <branch>', description: 'Switch to a branch', major: true },
    'switch-create': { name: 'switch -c', command: 'git switch -c <new-branch>', description: 'Create and switch to branch', major: true },
    'checkout': { name: 'git checkout', command: 'git checkout <branch>', description: 'Switch branches (old way)', major: false },
    'checkout-b': { name: 'checkout -b', command: 'git checkout -b <new-branch>', description: 'Create and switch (old way)', major: false },
    'merge': { name: 'git merge', command: 'git merge <branch>', description: 'Combine branches together', major: true },
    'merge-no-ff': { name: 'merge --no-ff', command: 'git merge --no-ff <branch>', description: 'Force a merge commit', major: false },
    'merge-squash': { name: 'merge --squash', command: 'git merge --squash <branch>', description: 'Squash all commits into one', major: false },
    'merge-abort': { name: 'merge --abort', command: 'git merge --abort', description: 'Cancel an in-progress merge', major: false },
    'merge-conflicts': { name: 'merge conflicts', command: 'resolve conflicts manually', description: 'Handle conflicting changes', major: true },
    'rebase': { name: 'git rebase', command: 'git rebase main', description: 'Replay commits on top of branch', major: true },
    'rebase-onto': { name: 'rebase --onto', command: 'git rebase --onto main A B', description: 'Rebase a range of commits', major: false },
    'rebase-interactive': { name: 'rebase -i', command: 'git rebase -i HEAD~3', description: 'Squash, reorder, drop commits', major: true },
    'rebase-continue': { name: 'rebase --continue', command: 'git rebase --continue', description: 'Resume after fixing conflicts', major: false },
    'rebase-abort': { name: 'rebase --abort', command: 'git rebase --abort', description: 'Cancel rebase, restore original', major: false },
    'cherry-pick': { name: 'cherry-pick', command: 'git cherry-pick <sha>', description: 'Copy specific commit to branch', major: true },
    'cherry-pick-no-commit': { name: 'cherry-pick -n', command: 'git cherry-pick -n <sha>', description: 'Apply changes without committing', major: false },

    // Undo & Fix line
    'restore': { name: 'git restore', command: 'git restore <file>', description: 'Discard unstaged changes', major: true },
    'restore-staged': { name: 'restore --staged', command: 'git restore --staged <file>', description: 'Unstage a file', major: true },
    'reset-soft': { name: 'reset --soft', command: 'git reset --soft HEAD~1', description: 'Undo commit, keep staged', major: true },
    'reset-mixed': { name: 'reset --mixed', command: 'git reset HEAD~1', description: 'Undo commit, unstage', major: true },
    'reset-hard': { name: 'reset --hard', command: 'git reset --hard HEAD~1', description: 'Undo commit, delete changes', major: true },
    'revert': { name: 'git revert', command: 'git revert <sha>', description: 'Undo commit with new commit', major: true },
    'revert-no-commit': { name: 'revert -n', command: 'git revert -n <sha>', description: 'Revert without auto-commit', major: false },
    'stash': { name: 'git stash', command: 'git stash', description: 'Shelve uncommitted changes', major: true },
    'stash-pop': { name: 'stash pop', command: 'git stash pop', description: 'Restore and remove top stash', major: true },
    'stash-apply': { name: 'stash apply', command: 'git stash apply', description: 'Restore without removing', major: false },
    'stash-drop': { name: 'stash drop', command: 'git stash drop', description: 'Delete a stash entry', major: false },
    'stash-list': { name: 'stash list', command: 'git stash list', description: 'See all stashed changes', major: false },
    'stash-branch': { name: 'stash branch', command: 'git stash branch <name>', description: 'Create branch from stash', major: false },
    'clean': { name: 'git clean', command: 'git clean -fd', description: 'Remove untracked files', major: true },
    'clean-dry': { name: 'clean -n', command: 'git clean -n', description: 'Preview what would be removed', major: false },
    'rm': { name: 'git rm', command: 'git rm <file>', description: 'Remove file from repo and disk', major: false },
    'rm-cached': { name: 'rm --cached', command: 'git rm --cached <file>', description: 'Untrack file, keep on disk', major: true },

    // Inspect & Debug line
    'log': { name: 'git log', command: 'git log', description: 'View commit history', major: true },
    'log-oneline': { name: 'log --oneline', command: 'git log --oneline', description: 'Compact one-line history', major: true },
    'log-graph': { name: 'log --graph', command: 'git log --graph --oneline --all', description: 'Visual branch graph', major: true },
    'log-author': { name: 'log --author', command: 'git log --author="Name"', description: 'Filter by author', major: false },
    'log-since': { name: 'log --since', command: 'git log --since="2 weeks ago"', description: 'Filter by date', major: false },
    'log-grep': { name: 'log --grep', command: 'git log --grep="fix"', description: 'Search commit messages', major: false },
    'log-s': { name: 'log -S', command: 'git log -S "functionName"', description: 'Find when code appeared', major: false },
    'show': { name: 'git show', command: 'git show <sha>', description: 'Show commit details and diff', major: true },
    'diff-stat': { name: 'diff --stat', command: 'git diff --stat', description: 'Summary of changes', major: false },
    'blame': { name: 'git blame', command: 'git blame <file>', description: 'Who changed each line', major: true },
    'blame-l': { name: 'blame -L', command: 'git blame -L 10,20 <file>', description: 'Blame specific lines only', major: false },
    'bisect': { name: 'git bisect', command: 'git bisect start', description: 'Binary search for bug', major: true },
    'bisect-good': { name: 'bisect good', command: 'git bisect good', description: 'Mark commit as bug-free', major: false },
    'bisect-bad': { name: 'bisect bad', command: 'git bisect bad', description: 'Mark commit as broken', major: false },
    'bisect-reset': { name: 'bisect reset', command: 'git bisect reset', description: 'End bisect session', major: false },
    'reflog': { name: 'git reflog', command: 'git reflog', description: 'History of HEAD movements', major: true },
    'shortlog': { name: 'git shortlog', command: 'git shortlog -sn', description: 'Commit count by author', major: false },
    'whatchanged': { name: 'whatchanged', command: 'git whatchanged --since="1 week"', description: 'Files changed recently', major: false },

    // Collaboration line
    'fork-workflow': { name: 'fork workflow', command: 'fork → clone → branch → PR', description: 'Contributing to open source', major: true },
    'upstream-sync': { name: 'sync upstream', command: 'git fetch upstream && git merge upstream/main', description: 'Keep fork up to date', major: true },
    'pull-request': { name: 'pull request', command: 'gh pr create / GitHub UI', description: 'Propose changes for review', major: true },
    'tag': { name: 'git tag', command: 'git tag v1.0.0', description: 'Mark a release point', major: true },
    'tag-annotated': { name: 'tag -a', command: 'git tag -a v1.0.0 -m "msg"', description: 'Tag with metadata', major: false },
    'tag-push': { name: 'tag push', command: 'git push origin v1.0.0', description: 'Push tag to remote', major: false },
    'tag-delete': { name: 'tag -d', command: 'git tag -d v1.0.0', description: 'Delete a local tag', major: false },
    'submodule-add': { name: 'submodule add', command: 'git submodule add <url>', description: 'Embed another repo', major: false },
    'submodule-update': { name: 'submodule update', command: 'git submodule update --init', description: 'Pull submodule contents', major: false },
    'submodule-init': { name: 'submodule init', command: 'git submodule init', description: 'Register submodule config', major: false },

    // Advanced line
    'worktree-add': { name: 'worktree add', command: 'git worktree add ../fix main', description: 'Work on two branches at once', major: true },
    'worktree-remove': { name: 'worktree remove', command: 'git worktree remove ../fix', description: 'Clean up extra worktree', major: false },
    'worktree-list': { name: 'worktree list', command: 'git worktree list', description: 'See active worktrees', major: false },
    'filter-branch': { name: 'filter-branch', command: 'git filter-branch (deprecated)', description: 'Rewrite entire history', major: false },
    'filter-repo': { name: 'filter-repo', command: 'git filter-repo --path src/', description: 'Modern history rewriting', major: true },
    'archive': { name: 'git archive', command: 'git archive --format=zip HEAD', description: 'Export repo as archive', major: false },
    'bundle': { name: 'git bundle', command: 'git bundle create repo.bundle --all', description: 'Package repo for offline transfer', major: false },
    'gc': { name: 'git gc', command: 'git gc', description: 'Clean up and optimize repo', major: false },
    'fsck': { name: 'git fsck', command: 'git fsck', description: 'Verify repo integrity', major: false },
    'prune': { name: 'git prune', command: 'git prune', description: 'Remove unreachable objects', major: false },
    'pack-refs': { name: 'pack-refs', command: 'git pack-refs --all', description: 'Compact reference storage', major: false },
    'notes': { name: 'git notes', command: 'git notes add -m "note"', description: 'Add notes to commits', major: false },
    'replace': { name: 'git replace', command: 'git replace <old> <new>', description: 'Override commit references', major: false },
    'rerere': { name: 'git rerere', command: 'git config rerere.enabled true', description: 'Remember conflict resolutions', major: true },
    'sparse-checkout': { name: 'sparse-checkout', command: 'git sparse-checkout set src/', description: 'Only checkout some folders', major: true },
    'shallow-clone': { name: 'clone --depth', command: 'git clone --depth 1 <url>', description: 'Clone without full history', major: true },
    'grafts': { name: 'grafts', command: '.git/info/grafts', description: 'Fake parent commits', major: false },
  };

  const lineMap: Record<string, string[]> = {};
  for (const line of METRO_LINES) {
    for (const sid of line.stations) {
      if (!lineMap[sid]) lineMap[sid] = [];
      lineMap[sid].push(line.id);
    }
  }

  const stations: MetroStation[] = [];
  const placed = new Map<string, MetroStation>();

  const lineLayouts: { baseY: number; startX: number; angle: number }[] = [
    { baseY: 100, startX: 80, angle: 0.02 },
    { baseY: 280, startX: 60, angle: -0.015 },
    { baseY: 460, startX: 100, angle: 0.01 },
    { baseY: 640, startX: 50, angle: -0.02 },
    { baseY: 820, startX: 90, angle: 0.018 },
    { baseY: 1000, startX: 70, angle: -0.01 },
    { baseY: 1180, startX: 110, angle: 0.012 },
  ];

  for (let li = 0; li < METRO_LINES.length; li++) {
    const line = METRO_LINES[li];
    const layout = lineLayouts[li];
    let x = layout.startX;

    line.stations.forEach((sid, i) => {
      const info = raw[sid];
      if (!info) return;

      const spacing = info.major ? 140 : 100;
      x += spacing;

      if (placed.has(sid)) {
        const existing = placed.get(sid)!;
        if (!existing.lineIds.includes(line.id)) {
          existing.lineIds.push(line.id);
        }
        return;
      }

      const wave = Math.sin(i * 0.8 + li * 2) * 35;
      const drift = i * layout.angle * 100;
      const y = layout.baseY + wave + drift;

      const station: MetroStation = {
        id: sid,
        name: info.name,
        command: info.command,
        description: info.description,
        x,
        y,
        major: info.major,
        lineIds: lineMap[sid] || [line.id],
      };
      stations.push(station);
      placed.set(sid, station);
    });
  }

  return stations;
}

export function getLineColor(lineId: string): string {
  return METRO_LINES.find(l => l.id === lineId)?.color || '#888';
}
