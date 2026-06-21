export interface WorldLevel {
  name: string;
  description: string;
  commands: string[];
}

export interface World {
  id: number;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  unlockAfter: number | null;
  levels: WorldLevel[];
}

export const WORLDS: World[] = [
  {
    id: 1,
    name: 'First Commit',
    emoji: '🌱',
    tagline: 'Your journey begins here',
    color: '#81b29a',
    unlockAfter: null,
    levels: [
      {
        name: 'The Beginning',
        description: 'Create a repo and understand what Git is',
        commands: ['init', 'clone', 'config'],
      },
      {
        name: 'Tracking Files',
        description: 'See changes, stage them, ignore what you don\'t need',
        commands: ['status', 'add', 'gitignore'],
      },
      {
        name: 'Your First Snapshot',
        description: 'Commit your work and view what changed',
        commands: ['commit', 'diff', 'log'],
      },
      {
        name: 'File Operations',
        description: 'Move, remove, and inspect files under Git',
        commands: ['show', 'rm', 'mv'],
      },
    ],
  },
  {
    id: 2,
    name: 'Daily Developer',
    emoji: '⚡',
    tagline: 'Commands you\'ll use every single day',
    color: '#5b8fb9',
    unlockAfter: 1,
    levels: [
      {
        name: 'Going Remote',
        description: 'Connect your repo to the world',
        commands: ['remote', 'push', 'push-u'],
      },
      {
        name: 'Staying in Sync',
        description: 'Get your teammate\'s changes',
        commands: ['pull', 'fetch', 'pull-rebase'],
      },
      {
        name: 'Polishing Commits',
        description: 'Amend, stage selectively, view staged changes',
        commands: ['commit-amend', 'add-p', 'diff-staged'],
      },
      {
        name: 'Quick Saves',
        description: 'Stash work, tag releases, create aliases',
        commands: ['stash', 'stash-pop', 'tag'],
      },
      {
        name: 'Efficient Logging',
        description: 'Power options for reading history',
        commands: ['log-oneline', 'fetch-prune', 'alias'],
      },
    ],
  },
  {
    id: 3,
    name: 'Branch Ninja',
    emoji: '🌿',
    tagline: 'Think in parallel',
    color: '#e07a5f',
    unlockAfter: 2,
    levels: [
      {
        name: 'Your First Branch',
        description: 'Create branches and move between them',
        commands: ['branch', 'switch', 'switch-c'],
      },
      {
        name: 'Branch Management',
        description: 'Rename, delete, and inspect branches',
        commands: ['branch-d', 'branch-m', 'branch-a'],
      },
      {
        name: 'Coming Together',
        description: 'Merge branches and understand strategies',
        commands: ['merge', 'merge-no-ff', 'merge-squash'],
      },
      {
        name: 'When Worlds Collide',
        description: 'Handle merge conflicts like a pro',
        commands: ['conflicts', 'merge-abort', 'rerere'],
      },
      {
        name: 'Legacy Moves',
        description: 'The older checkout commands',
        commands: ['checkout', 'checkout-b', 'branch-v'],
      },
    ],
  },
  {
    id: 4,
    name: 'Time Machine',
    emoji: '⏳',
    tagline: 'Nothing is ever truly lost',
    color: '#9b8fb4',
    unlockAfter: 3,
    levels: [
      {
        name: 'Quick Undo',
        description: 'Discard changes and unstage files',
        commands: ['restore', 'restore-staged', 'checkout-file'],
      },
      {
        name: 'Reset Flavors',
        description: 'Three ways to undo commits',
        commands: ['reset-soft', 'reset-mixed', 'reset-hard'],
      },
      {
        name: 'Safe Undo',
        description: 'Revert commits on shared branches',
        commands: ['revert', 'revert-n', 'ORIG_HEAD'],
      },
      {
        name: 'The Safety Net',
        description: 'Reflog — your 90-day undo history',
        commands: ['reflog', 'reset-to-reflog'],
      },
      {
        name: 'Stash Mastery',
        description: 'Advanced stash operations',
        commands: ['stash-list', 'stash-apply', 'stash-drop', 'stash-branch'],
      },
      {
        name: 'Cleanup',
        description: 'Remove untracked files and cached entries',
        commands: ['clean', 'clean-n', 'rm-cached'],
      },
    ],
  },
  {
    id: 5,
    name: 'Collaboration',
    emoji: '🤝',
    tagline: 'Work with others without losing your mind',
    color: '#f2cc8f',
    unlockAfter: 3,
    levels: [
      {
        name: 'Remote Setup',
        description: 'Add, rename, and manage remotes',
        commands: ['remote-add', 'remote-v', 'remote-set-url'],
      },
      {
        name: 'Fork & Contribute',
        description: 'The open-source workflow',
        commands: ['fork-workflow', 'upstream-sync', 'pull-request'],
      },
      {
        name: 'Pushing Like a Pro',
        description: 'Force push safely, delete remote branches',
        commands: ['push-force', 'push-delete', 'push-tags'],
      },
      {
        name: 'Release Management',
        description: 'Tags and versioning',
        commands: ['tag-a', 'tag-push', 'tag-d'],
      },
      {
        name: 'Subprojects',
        description: 'Repos inside repos',
        commands: ['submodule-add', 'submodule-update', 'submodule-init'],
      },
    ],
  },
  {
    id: 6,
    name: 'History Master',
    emoji: '🔬',
    tagline: 'Rewrite history like a pro',
    color: '#e63946',
    unlockAfter: 4,
    levels: [
      {
        name: 'Rebase Basics',
        description: 'Replay commits on a new base',
        commands: ['rebase', 'rebase-continue', 'rebase-abort'],
      },
      {
        name: 'Interactive Rebase',
        description: 'Squash, reorder, and reword commits',
        commands: ['rebase-i', 'commit-fixup', 'rebase-onto'],
      },
      {
        name: 'Surgical Precision',
        description: 'Cherry-pick specific commits',
        commands: ['cherry-pick', 'cherry-pick-n'],
      },
      {
        name: 'Bug Detective',
        description: 'Binary search for the broken commit',
        commands: ['bisect', 'bisect-good', 'bisect-bad', 'bisect-reset'],
      },
      {
        name: 'Code Archaeology',
        description: 'Who wrote what and when',
        commands: ['blame', 'blame-L', 'log-S'],
      },
      {
        name: 'Log Power Mode',
        description: 'Filter, search, and visualize history',
        commands: ['log-graph', 'log-grep', 'log-author', 'shortlog'],
      },
    ],
  },
  {
    id: 7,
    name: 'Git Wizard',
    emoji: '🧙',
    tagline: 'Power-user territory',
    color: '#3d405b',
    unlockAfter: 5,
    levels: [
      {
        name: 'Parallel Worlds',
        description: 'Work on multiple branches simultaneously',
        commands: ['worktree-add', 'worktree-remove', 'worktree-list'],
      },
      {
        name: 'Selective Checkout',
        description: 'Only download what you need',
        commands: ['sparse-checkout', 'shallow-clone'],
      },
      {
        name: 'History Surgery',
        description: 'Rewrite entire repository history',
        commands: ['filter-repo', 'filter-branch'],
      },
      {
        name: 'Patches & Archives',
        description: 'Share changes without pushing',
        commands: ['format-patch', 'am', 'archive', 'bundle'],
      },
      {
        name: 'Hooks & Config',
        description: 'Automate and customize Git behavior',
        commands: ['hooks', 'gitattributes', 'lfs-install', 'lfs-track'],
      },
      {
        name: 'Advanced Tools',
        description: 'Niche but powerful commands',
        commands: ['notes', 'replace', 'describe', 'rev-parse'],
      },
    ],
  },
  {
    id: 8,
    name: 'Plumbing',
    emoji: '🔧',
    tagline: 'The engine room — understand Git internals',
    color: '#6b705c',
    unlockAfter: 7,
    levels: [
      {
        name: 'Git Objects',
        description: 'Blobs, trees, commits — the building blocks',
        commands: ['cat-file', 'hash-object', 'ls-tree'],
      },
      {
        name: 'The Index',
        description: 'How staging really works',
        commands: ['ls-files', 'update-index', 'read-tree'],
      },
      {
        name: 'References',
        description: 'How branches and tags actually work',
        commands: ['for-each-ref', 'update-ref', 'symbolic-ref'],
      },
      {
        name: 'History Internals',
        description: 'Commits and trees under the hood',
        commands: ['rev-list', 'write-tree', 'commit-tree'],
      },
      {
        name: 'Maintenance',
        description: 'Keep your repo healthy',
        commands: ['gc', 'fsck', 'prune', 'pack-refs'],
      },
      {
        name: 'Deep Plumbing',
        description: 'The commands almost nobody uses',
        commands: ['count-objects', 'verify-pack', 'mktree', 'diff-index'],
      },
    ],
  },
];

export function getTotalCommands(): number {
  return WORLDS.reduce((sum, w) => sum + w.levels.reduce((s, l) => s + l.commands.length, 0), 0);
}

export function getWorldCommands(worldId: number): string[] {
  const world = WORLDS.find(w => w.id === worldId);
  if (!world) return [];
  return world.levels.flatMap(l => l.commands);
}
