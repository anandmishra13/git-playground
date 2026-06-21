export interface GitCommand {
  name: string;
  command: string;
  description: string;
  whatItDoes: string;
  beforeState: FileState[];
  afterState: FileState[];
  terminalOutput: string[];
  gitGraph?: GraphState;
  afterGraph?: GraphState;
  tags?: string[];
}

export interface FileState {
  name: string;
  content: string;
  status?: 'modified' | 'new' | 'deleted' | 'renamed' | 'staged' | 'untracked';
}

export interface GraphNode {
  id: string;
  message: string;
  branch: string;
  x: number;
  y: number;
  color: string;
  highlight?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  color: string;
  dashed?: boolean;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  head: string;
  branches: { name: string; pointsTo: string; color: string }[];
}

export interface CommandCategory {
  name: string;
  icon: string;
  description: string;
  commands: GitCommand[];
}

const COLORS = {
  main: '#e07a5f',
  feature: '#81b29a',
  hotfix: '#f2cc8f',
  develop: '#3d405b',
  stash: '#9b8fb4',
  cherry: '#e63946',
};

export const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    name: 'The Basics',
    icon: 'abc',
    description: 'You probably know these — skim or skip',
    commands: [
      {
        name: 'init',
        command: 'git init',
        description: 'Create a new Git repository',
        whatItDoes: 'Creates a .git folder in your project directory. Nothing is tracked until you run this.',
        beforeState: [
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'untracked' },
          { name: 'package.json', content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}', status: 'untracked' },
        ],
        afterState: [
          { name: '.git/', content: '(repository initialized)', status: 'new' },
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'untracked' },
          { name: 'package.json', content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}', status: 'untracked' },
        ],
        terminalOutput: [
          '$ git init',
          'Initialized empty Git repository in /project/.git/',
          '',
          '# A .git folder is born. Your project is now trackable.',
        ],
      },
      {
        name: 'add & commit',
        command: 'git add . && git commit -m "initial commit"',
        description: 'Stage and snapshot your changes',
        whatItDoes: 'git add moves files into the staging area (the "index"). git commit saves a snapshot of whatever is staged. You stage first, then commit.',
        beforeState: [
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'untracked' },
          { name: 'utils.js', content: 'export const sum = (a, b) => a + b;', status: 'untracked' },
        ],
        afterState: [
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'staged' },
          { name: 'utils.js', content: 'export const sum = (a, b) => a + b;', status: 'staged' },
        ],
        terminalOutput: [
          '$ git add .',
          '$ git commit -m "initial commit"',
          '[main (root-commit) a1b2c3d] initial commit',
          ' 2 files changed, 4 insertions(+)',
          ' create mode 100644 app.js',
          ' create mode 100644 utils.js',
        ],
        gitGraph: {
          nodes: [],
          edges: [],
          head: '',
          branches: [],
        },
        afterGraph: {
          nodes: [
            { id: 'a1b2c3d', message: 'initial commit', branch: 'main', x: 300, y: 100, color: COLORS.main },
          ],
          edges: [],
          head: 'a1b2c3d',
          branches: [{ name: 'main', pointsTo: 'a1b2c3d', color: COLORS.main }],
        },
      },
    ],
  },
  {
    name: 'Rewriting History',
    icon: 'hst',
    description: 'The powerful (and dangerous) stuff',
    commands: [
      {
        name: 'rebase',
        command: 'git rebase main',
        description: 'Replay your commits on top of another branch',
        whatItDoes: 'Rebase picks up your feature branch commits, removes them temporarily, fast-forwards to the tip of main, and replays your commits on top one by one. You end up with a linear history, like you started your work from the latest main all along.',
        beforeState: [
          { name: 'feature.js', content: '// feature work\nexport const newFeature = () => {\n  return "awesome";\n};', status: 'modified' },
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);\n// main has moved ahead', status: 'modified' },
        ],
        afterState: [
          { name: 'feature.js', content: '// feature work (rebased)\nexport const newFeature = () => {\n  return "awesome";\n};', status: 'modified' },
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);\n// main has moved ahead\n// your feature is now on top', status: 'modified' },
        ],
        terminalOutput: [
          '$ git rebase main',
          'First, rewinding head to replay your work on top of it...',
          'Applying: add new feature',
          'Applying: polish feature',
          '',
          '# Your 2 commits are now sitting on top of main\'s latest.',
          '# History looks linear — no merge commit needed.',
        ],
        gitGraph: {
          nodes: [
            { id: 'c1', message: 'initial commit', branch: 'main', x: 100, y: 150, color: COLORS.main },
            { id: 'c2', message: 'add routes', branch: 'main', x: 220, y: 150, color: COLORS.main },
            { id: 'c3', message: 'fix bug on main', branch: 'main', x: 340, y: 150, color: COLORS.main },
            { id: 'f1', message: 'add new feature', branch: 'feature', x: 280, y: 60, color: COLORS.feature },
            { id: 'f2', message: 'polish feature', branch: 'feature', x: 400, y: 60, color: COLORS.feature },
          ],
          edges: [
            { from: 'c1', to: 'c2', color: COLORS.main },
            { from: 'c2', to: 'c3', color: COLORS.main },
            { from: 'c2', to: 'f1', color: COLORS.feature },
            { from: 'f1', to: 'f2', color: COLORS.feature },
          ],
          head: 'f2',
          branches: [
            { name: 'main', pointsTo: 'c3', color: COLORS.main },
            { name: 'feature', pointsTo: 'f2', color: COLORS.feature },
          ],
        },
        afterGraph: {
          nodes: [
            { id: 'c1', message: 'initial commit', branch: 'main', x: 100, y: 100, color: COLORS.main },
            { id: 'c2', message: 'add routes', branch: 'main', x: 220, y: 100, color: COLORS.main },
            { id: 'c3', message: 'fix bug on main', branch: 'main', x: 340, y: 100, color: COLORS.main },
            { id: 'f1r', message: 'add new feature', branch: 'feature', x: 460, y: 100, color: COLORS.feature, highlight: true },
            { id: 'f2r', message: 'polish feature', branch: 'feature', x: 580, y: 100, color: COLORS.feature, highlight: true },
          ],
          edges: [
            { from: 'c1', to: 'c2', color: COLORS.main },
            { from: 'c2', to: 'c3', color: COLORS.main },
            { from: 'c3', to: 'f1r', color: COLORS.feature },
            { from: 'f1r', to: 'f2r', color: COLORS.feature },
          ],
          head: 'f2r',
          branches: [
            { name: 'main', pointsTo: 'c3', color: COLORS.main },
            { name: 'feature', pointsTo: 'f2r', color: COLORS.feature },
          ],
        },
      },
      {
        name: 'interactive rebase',
        command: 'git rebase -i HEAD~3',
        description: 'Rewrite, squash, reorder, or drop commits',
        whatItDoes: 'Opens an editor showing your last N commits. For each one you choose: pick (keep it), squash (merge into the previous), reword (change the message), edit (pause so you can amend), or drop (delete it). Really handy for cleaning up a messy branch before you push.',
        beforeState: [
          { name: 'git-rebase-todo', content: 'pick a1b2c3d fix typo\npick e4f5g6h fix typo again\npick i7j8k9l add real feature', status: 'modified' },
        ],
        afterState: [
          { name: 'git-rebase-todo', content: 'pick a1b2c3d fix typo\nsquash e4f5g6h fix typo again\npick i7j8k9l add real feature', status: 'modified' },
        ],
        terminalOutput: [
          '$ git rebase -i HEAD~3',
          '',
          '# Commands:',
          '# p, pick   = use commit',
          '# r, reword = use commit, but edit the message',
          '# e, edit   = use commit, but pause for amending',
          '# s, squash = meld into previous commit',
          '# f, fixup  = like squash, but discard this log message',
          '# d, drop   = remove commit entirely',
          '',
          '# Change "pick" to "squash" on the 2nd line →',
          '# Two typo-fix commits become one clean commit.',
          '',
          'Successfully rebased and updated refs/head/main.',
        ],
        gitGraph: {
          nodes: [
            { id: 'c0', message: 'initial commit', branch: 'main', x: 100, y: 100, color: COLORS.main },
            { id: 'c1', message: 'fix typo', branch: 'main', x: 230, y: 100, color: COLORS.main },
            { id: 'c2', message: 'fix typo again', branch: 'main', x: 360, y: 100, color: COLORS.main },
            { id: 'c3', message: 'add real feature', branch: 'main', x: 490, y: 100, color: COLORS.main },
          ],
          edges: [
            { from: 'c0', to: 'c1', color: COLORS.main },
            { from: 'c1', to: 'c2', color: COLORS.main },
            { from: 'c2', to: 'c3', color: COLORS.main },
          ],
          head: 'c3',
          branches: [{ name: 'main', pointsTo: 'c3', color: COLORS.main }],
        },
        afterGraph: {
          nodes: [
            { id: 'c0', message: 'initial commit', branch: 'main', x: 100, y: 100, color: COLORS.main },
            { id: 'c1s', message: 'fix typo (squashed)', branch: 'main', x: 280, y: 100, color: COLORS.main, highlight: true },
            { id: 'c3r', message: 'add real feature', branch: 'main', x: 460, y: 100, color: COLORS.main, highlight: true },
          ],
          edges: [
            { from: 'c0', to: 'c1s', color: COLORS.main },
            { from: 'c1s', to: 'c3r', color: COLORS.main },
          ],
          head: 'c3r',
          branches: [{ name: 'main', pointsTo: 'c3r', color: COLORS.main }],
        },
      },
      {
        name: 'amend',
        command: 'git commit --amend',
        description: 'Modify the most recent commit',
        whatItDoes: 'Lets you redo the last commit. Forgot a file or made a typo in the message? Stage your fix, run --amend, and it replaces the previous commit with a new one that has everything combined.',
        beforeState: [
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'staged' },
          { name: 'config.js', content: '// oops, forgot this file', status: 'untracked' },
        ],
        afterState: [
          { name: 'app.js', content: 'const app = express();\napp.listen(3000);', status: 'staged' },
          { name: 'config.js', content: '// now included in the commit!', status: 'staged' },
        ],
        terminalOutput: [
          '$ git add config.js',
          '$ git commit --amend -m "add app and config"',
          '[main 7x8y9z0] add app and config',
          ' Date: Sat Jun 21 10:00:00 2026',
          ' 2 files changed, 3 insertions(+)',
          '',
          '# The previous commit is gone — replaced by this one.',
          '# ⚠️  Never amend commits you\'ve already pushed!',
        ],
      },
      {
        name: 'reset',
        command: 'git reset --soft/--mixed/--hard HEAD~1',
        description: 'Undo commits with varying degrees of destruction',
        whatItDoes: 'Three flavors of undo. --soft keeps your changes staged. --mixed (the default) unstages them but leaves the files alone. --hard wipes everything, changes gone for real. Be careful with --hard.',
        beforeState: [
          { name: 'app.js', content: 'const app = express();\n// committed changes here\napp.listen(3000);', status: 'staged' },
        ],
        afterState: [
          { name: 'app.js (--soft)', content: 'const app = express();\n// changes still staged\napp.listen(3000);', status: 'staged' },
          { name: 'app.js (--mixed)', content: 'const app = express();\n// changes unstaged but in working dir\napp.listen(3000);', status: 'modified' },
          { name: 'app.js (--hard)', content: 'const app = express();\napp.listen(3000);', status: 'deleted' },
        ],
        terminalOutput: [
          '$ git reset --soft HEAD~1   # Undo commit, keep staged',
          '$ git reset --mixed HEAD~1  # Undo commit, unstage (default)',
          '$ git reset --hard HEAD~1   # Undo commit, DELETE changes',
          '',
          '# --soft is safe. --mixed is safe. --hard is DESTRUCTIVE.',
          '# HEAD~1 means "go back 1 commit". HEAD~3 goes back 3.',
        ],
      },
    ],
  },
  {
    name: 'Recovery & Time Travel',
    icon: 'sos',
    description: 'When things go wrong (they will)',
    commands: [
      {
        name: 'reflog',
        command: 'git reflog',
        description: 'Your safety net — see everywhere HEAD has been',
        whatItDoes: 'Git keeps a log of every time HEAD moves. Commits, checkouts, rebases, resets, merges, all of it. Even after a reset --hard, the old commits still exist in the reflog for about 90 days. Find the SHA you need and reset back to it.',
        beforeState: [
          { name: 'terminal', content: '# You just ran git reset --hard and lost work.\n# Panic mode: ON\n# But wait...', status: 'deleted' },
        ],
        afterState: [
          { name: 'terminal', content: '# Found it in reflog!\n# git reset --hard abc1234\n# Work recovered. Crisis averted.', status: 'new' },
        ],
        terminalOutput: [
          '$ git reflog',
          'a1b2c3d HEAD@{0}: reset: moving to HEAD~3    ← you are here',
          'f4e5d6c HEAD@{1}: commit: add payment flow     ← your lost work!',
          'b7a8c9d HEAD@{2}: commit: add user auth',
          'e0f1g2h HEAD@{3}: commit: initial setup',
          '',
          '$ git reset --hard f4e5d6c',
          'HEAD is now at f4e5d6c add payment flow',
          '',
          '# 🎉 Your "deleted" commits are back!',
          '# Reflog is your 90-day safety net.',
        ],
      },
      {
        name: 'bisect',
        command: 'git bisect start / good / bad',
        description: 'Binary search for the commit that introduced a bug',
        whatItDoes: 'You mark one commit as "bad" (has the bug) and one as "good" (no bug). Git does a binary search between them, checking out the midpoint each time for you to test. With 1024 commits between good and bad, you find the broken one in about 10 steps.',
        beforeState: [
          { name: 'app.js', content: '// Somewhere in the last 100 commits,\n// a bug was introduced.\n// Which commit broke it?\n// Checking manually = hours.\n// Bisect = minutes.', status: 'modified' },
        ],
        afterState: [
          { name: 'app.js', content: '// Found it!\n// Commit e4f5g6h by Dave\n// "refactor: optimize query"\n// That\'s where the bug came in.', status: 'modified' },
        ],
        terminalOutput: [
          '$ git bisect start',
          '$ git bisect bad              # current commit is broken',
          '$ git bisect good v1.0.0      # this old tag worked fine',
          '',
          'Bisecting: 50 revisions left to test (roughly 6 steps)',
          '[abc1234] refactor: move utils',
          '',
          '# Test this commit... works? Mark it:',
          '$ git bisect good',
          '',
          'Bisecting: 25 revisions left to test (roughly 5 steps)',
          '# ...repeat until:',
          '',
          'e4f5g6h is the first bad commit',
          'commit e4f5g6h',
          'Author: Dave <dave@example.com>',
          'Date:   Mon Jun 15 14:30:00 2026',
          '    refactor: optimize query',
          '',
          '$ git bisect reset  # go back to where you were',
        ],
      },
      {
        name: 'cherry-pick',
        command: 'git cherry-pick <commit-sha>',
        description: 'Copy a specific commit onto your current branch',
        whatItDoes: 'Grabs one specific commit from somewhere else in the repo and applies it to your current branch. Unlike merge which brings over everything, cherry-pick only copies the commit you point at. Useful when you fix a bug on develop and need that same fix on main right now.',
        beforeState: [
          { name: 'hotfix.js', content: '// This fix exists on develop branch\n// but main needs it NOW\nexport const fix = () => {\n  return sanitize(input); // security fix\n};', status: 'modified' },
        ],
        afterState: [
          { name: 'hotfix.js', content: '// Cherry-picked from develop!\n// Same fix, now on main too\nexport const fix = () => {\n  return sanitize(input); // security fix\n};', status: 'new' },
        ],
        terminalOutput: [
          '$ git log develop --oneline',
          'e4f5g6h (develop) fix: sanitize user input',
          'a1b2c3d feat: add dashboard',
          '',
          '$ git checkout main',
          '$ git cherry-pick e4f5g6h',
          '[main 9z8y7x6] fix: sanitize user input',
          ' 1 file changed, 1 insertion(+)',
          '',
          '# Only the security fix came over.',
          '# The dashboard feature stayed on develop.',
        ],
        gitGraph: {
          nodes: [
            { id: 'c1', message: 'initial', branch: 'main', x: 100, y: 150, color: COLORS.main },
            { id: 'c2', message: 'release v1', branch: 'main', x: 240, y: 150, color: COLORS.main },
            { id: 'd1', message: 'add dashboard', branch: 'develop', x: 240, y: 60, color: COLORS.feature },
            { id: 'd2', message: 'sanitize input', branch: 'develop', x: 380, y: 60, color: COLORS.cherry, highlight: true },
          ],
          edges: [
            { from: 'c1', to: 'c2', color: COLORS.main },
            { from: 'c1', to: 'd1', color: COLORS.feature },
            { from: 'd1', to: 'd2', color: COLORS.feature },
          ],
          head: 'c2',
          branches: [
            { name: 'main', pointsTo: 'c2', color: COLORS.main },
            { name: 'develop', pointsTo: 'd2', color: COLORS.feature },
          ],
        },
        afterGraph: {
          nodes: [
            { id: 'c1', message: 'initial', branch: 'main', x: 100, y: 150, color: COLORS.main },
            { id: 'c2', message: 'release v1', branch: 'main', x: 240, y: 150, color: COLORS.main },
            { id: 'c3', message: 'sanitize input', branch: 'main', x: 380, y: 150, color: COLORS.cherry, highlight: true },
            { id: 'd1', message: 'add dashboard', branch: 'develop', x: 240, y: 60, color: COLORS.feature },
            { id: 'd2', message: 'sanitize input', branch: 'develop', x: 380, y: 60, color: COLORS.cherry },
          ],
          edges: [
            { from: 'c1', to: 'c2', color: COLORS.main },
            { from: 'c2', to: 'c3', color: COLORS.cherry, dashed: true },
            { from: 'c1', to: 'd1', color: COLORS.feature },
            { from: 'd1', to: 'd2', color: COLORS.feature },
          ],
          head: 'c3',
          branches: [
            { name: 'main', pointsTo: 'c3', color: COLORS.main },
            { name: 'develop', pointsTo: 'd2', color: COLORS.feature },
          ],
        },
      },
    ],
  },
  {
    name: 'Stashing & Cleaning',
    icon: 'tmp',
    description: 'Shelve work without committing',
    commands: [
      {
        name: 'stash',
        command: 'git stash / git stash pop',
        description: 'Temporarily shelve your uncommitted changes',
        whatItDoes: 'Saves your uncommitted changes onto a stack and resets your working directory to a clean state. Switch branches, do whatever you need, then run git stash pop to get your changes back.',
        beforeState: [
          { name: 'feature.js', content: '// Half-done feature\nexport const half = () => {\n  // TODO: finish this\n};', status: 'modified' },
          { name: 'styles.css', content: '.new-component {\n  /* work in progress */\n}', status: 'new' },
        ],
        afterState: [
          { name: 'feature.js', content: '// clean working directory\n// your changes are on the stash stack', status: 'staged' },
          { name: 'stash@{0}', content: 'WIP on feature: half-done feature\n  feature.js (modified)\n  styles.css (new file)', status: 'new' },
        ],
        terminalOutput: [
          '$ git stash',
          'Saved working directory and index state WIP on feature: abc1234',
          '',
          '# Working directory is now clean. Go do the hotfix.',
          '',
          '$ git checkout main',
          '$ # ... fix the bug, commit, push ...',
          '$ git checkout feature',
          '',
          '$ git stash pop',
          'On branch feature',
          'Changes not staged for commit:',
          '  modified:   feature.js',
          'Untracked files:',
          '  styles.css',
          'Dropped refs/stash@{0}',
          '',
          '# Everything is back. Like you never left.',
        ],
      },
      {
        name: 'stash (advanced)',
        command: 'git stash list / show / apply / drop',
        description: 'Manage multiple stashes like a stack',
        whatItDoes: 'The stash is actually a stack, so you can stash multiple times. Use list to see them all, show to inspect one, apply to restore without removing from the stack (vs pop which removes it), and drop to delete one. You can also create a branch directly from a stash entry.',
        beforeState: [
          { name: 'stash stack', content: 'stash@{0}: WIP on feature-A: dark mode\nstash@{1}: WIP on feature-B: auth flow\nstash@{2}: WIP on main: config tweak', status: 'modified' },
        ],
        afterState: [
          { name: 'stash stack', content: 'stash@{0}: WIP on feature-A: dark mode\nstash@{2}: WIP on main: config tweak\n\n(stash@{1} was applied and dropped)', status: 'modified' },
        ],
        terminalOutput: [
          '$ git stash list',
          'stash@{0}: WIP on feature-A: dark mode',
          'stash@{1}: WIP on feature-B: auth flow',
          'stash@{2}: WIP on main: config tweak',
          '',
          '$ git stash show stash@{1}',
          ' auth.js | 15 +++++++++------',
          ' 1 file changed, 9 insertions(+), 6 deletions(-)',
          '',
          '$ git stash apply stash@{1}  # apply without removing',
          '$ git stash drop stash@{1}   # remove from stack',
          '',
          '# Pro tip: git stash branch new-branch stash@{0}',
          '# Creates a branch from the stash and applies it.',
        ],
      },
      {
        name: 'clean',
        command: 'git clean -fd',
        description: 'Remove untracked files and directories',
        whatItDoes: 'Deletes untracked files from your working directory. Build output, temp files, .DS_Store, that kind of stuff. -f is required (force), -d also removes directories, and -n does a dry run so you can check what would be deleted before actually doing it.',
        beforeState: [
          { name: 'app.js', content: '// tracked file — safe', status: 'staged' },
          { name: 'dist/', content: '// build output — untracked', status: 'untracked' },
          { name: '.DS_Store', content: '// macOS junk — untracked', status: 'untracked' },
          { name: 'temp.log', content: '// debug log — untracked', status: 'untracked' },
        ],
        afterState: [
          { name: 'app.js', content: '// tracked file — still here', status: 'staged' },
        ],
        terminalOutput: [
          '$ git clean -n    # dry run first!',
          'Would remove .DS_Store',
          'Would remove dist/',
          'Would remove temp.log',
          '',
          '$ git clean -fd   # now actually delete',
          'Removing .DS_Store',
          'Removing dist/',
          'Removing temp.log',
          '',
          '# Only untracked files are removed.',
          '# Tracked files are never touched.',
          '# Add -x to also remove .gitignored files.',
        ],
      },
    ],
  },
  {
    name: 'Advanced Workflows',
    icon: 'pro',
    description: 'The commands that separate juniors from seniors',
    commands: [
      {
        name: 'worktree',
        command: 'git worktree add ../hotfix main',
        description: 'Work on multiple branches simultaneously',
        whatItDoes: 'Creates a second working directory that shares the same .git repo but has a different branch checked out. So you can have main in one terminal and your feature branch in another, both at the same time. No stashing needed.',
        beforeState: [
          { name: 'project/', content: '// currently on feature branch\n// need to also work on main\n// but don\'t want to stash...', status: 'modified' },
        ],
        afterState: [
          { name: 'project/', content: '// still on feature branch\n// nothing changed here', status: 'modified' },
          { name: '../hotfix/', content: '// new directory!\n// checked out on main\n// linked to same .git', status: 'new' },
        ],
        terminalOutput: [
          '$ git worktree add ../hotfix main',
          'Preparing worktree (checking out \'main\')',
          'HEAD is now at a1b2c3d latest on main',
          '',
          '$ ls ../',
          'project/     ← your feature branch (unchanged)',
          'hotfix/      ← main branch (new worktree!)',
          '',
          '# Two directories. Two branches. One repo.',
          '# When done:',
          '$ git worktree remove ../hotfix',
          '',
          '# 💡 This is way better than stash-switch-stash.',
        ],
      },
      {
        name: 'revert',
        command: 'git revert <commit-sha>',
        description: 'Safely undo a commit by creating a new one',
        whatItDoes: 'Creates a new commit that undoes the changes from a specific older commit. The original commit stays in history, so nobody\'s history breaks. Use this on shared branches instead of reset, since reset rewrites history and that messes up everyone else.',
        beforeState: [
          { name: 'app.js', content: '// Current state includes a bad commit\nconst config = { debug: true }; // bad!\napp.use(dangerousMiddleware);    // bad!', status: 'modified' },
        ],
        afterState: [
          { name: 'app.js', content: '// Revert created a NEW commit\n// that undoes the bad one\nconst config = { debug: false };\n// dangerousMiddleware removed', status: 'new' },
        ],
        terminalOutput: [
          '$ git log --oneline',
          'e4f5g6h add dangerous debug config    ← this one is bad',
          'a1b2c3d add user auth',
          '',
          '$ git revert e4f5g6h',
          '[main 9z8y7x6] Revert "add dangerous debug config"',
          ' 1 file changed, 2 deletions(-)',
          '',
          '$ git log --oneline',
          '9z8y7x6 Revert "add dangerous debug config"  ← new undo commit',
          'e4f5g6h add dangerous debug config             ← still in history',
          'a1b2c3d add user auth',
          '',
          '# History is preserved. Safe for shared branches.',
          '# Unlike reset, this won\'t break your teammates.',
        ],
      },
      {
        name: 'blame',
        command: 'git blame <file>',
        description: 'See who changed each line and when',
        whatItDoes: 'Annotates each line of a file with who last changed it, when, and which commit. Useful when you want to know why a line looks the way it does or who to ask about it. Combine with git log -p <sha> to see the full diff for that commit.',
        beforeState: [
          { name: 'auth.js', content: 'const jwt = require("jsonwebtoken");\nconst SECRET = process.env.JWT_SECRET;\n\nfunction verify(token) {\n  return jwt.verify(token, SECRET);\n}', status: 'modified' },
        ],
        afterState: [
          { name: 'auth.js (blamed)', content: 'a1b2c3d (Alice  2026-01-15) const jwt = require("jsonwebtoken");\ne4f5g6h (Bob    2026-03-22) const SECRET = process.env.JWT_SECRET;\na1b2c3d (Alice  2026-01-15)\ne4f5g6h (Bob    2026-03-22) function verify(token) {\ni7j8k9l (Carol  2026-06-01)   return jwt.verify(token, SECRET);\ne4f5g6h (Bob    2026-03-22) }', status: 'modified' },
        ],
        terminalOutput: [
          '$ git blame auth.js',
          'a1b2c3d (Alice 2026-01-15 10:00)  1) const jwt = require("jsonwebtoken");',
          'e4f5g6h (Bob   2026-03-22 14:30)  2) const SECRET = process.env.JWT_SECRET;',
          'a1b2c3d (Alice 2026-01-15 10:00)  3)',
          'e4f5g6h (Bob   2026-03-22 14:30)  4) function verify(token) {',
          'i7j8k9l (Carol 2026-06-01 09:00)  5)   return jwt.verify(token, SECRET);',
          'e4f5g6h (Bob   2026-03-22 14:30)  6) }',
          '',
          '# Alice set up the file. Bob added auth logic.',
          '# Carol last touched line 5 — ask her about it.',
          '',
          '# Pro tip: git blame -L 4,6 auth.js',
          '# Only blame lines 4 through 6.',
        ],
      },
      {
        name: 'log (power mode)',
        command: 'git log --graph --oneline --all',
        description: 'Visualize your entire branch history',
        whatItDoes: 'Plain git log dumps a flat list of commits, which is hard to read. --graph adds ASCII branch lines, --oneline shows one commit per line, and --all includes every branch. You can also filter with --author, --since, --grep, or -S to search for when a string appeared.',
        beforeState: [
          { name: 'terminal', content: '# boring git log\n# commit after commit\n# wall of text\n# no structure visible', status: 'modified' },
        ],
        afterState: [
          { name: 'terminal', content: '# beautiful graph!\n# branches visible\n# merges clear\n# history at a glance', status: 'new' },
        ],
        terminalOutput: [
          '$ git log --graph --oneline --all',
          '* 9z8y7x6 (HEAD -> main) Merge feature into main',
          '|\\',
          '| * f4e5d6c (feature) add dark mode',
          '| * b7a8c9d add theme toggle',
          '|/',
          '* a1b2c3d add user auth',
          '* e0f1g2h initial commit',
          '',
          '# Useful aliases:',
          '$ git config --global alias.lg \\',
          '  "log --graph --oneline --all --decorate"',
          '',
          '# Now just type: git lg',
          '',
          '# Filter examples:',
          '$ git log --author="Alice" --since="2 weeks ago"',
          '$ git log --grep="fix" --oneline',
          '$ git log -S "functionName"  # find when code appeared',
        ],
      },
      {
        name: 'tag',
        command: 'git tag -a v1.0.0 -m "release 1.0"',
        description: 'Mark specific points in history (releases)',
        whatItDoes: 'Tags are permanent labels on specific commits, usually used for releases. A lightweight tag is just a name pointing at a commit. Annotated tags (-a) also store the tagger, date, and a message. Unlike branches, tags don\'t move forward when you make new commits.',
        beforeState: [
          { name: 'commits', content: 'abc1234 deploy: production ready\ndef5678 feat: final feature\nghi9012 fix: last bug', status: 'modified' },
        ],
        afterState: [
          { name: 'commits', content: 'abc1234 deploy: production ready  ← v1.0.0\ndef5678 feat: final feature\nghi9012 fix: last bug', status: 'new' },
        ],
        terminalOutput: [
          '$ git tag -a v1.0.0 -m "First stable release"',
          '',
          '$ git tag',
          'v0.1.0',
          'v0.2.0',
          'v1.0.0',
          '',
          '$ git show v1.0.0',
          'tag v1.0.0',
          'Tagger: You <you@email.com>',
          'Date:   Sat Jun 21 2026',
          'First stable release',
          '',
          '$ git push origin v1.0.0   # push a specific tag',
          '$ git push origin --tags   # push all tags',
          '',
          '# Tag a past commit:',
          '$ git tag -a v0.9.0 abc1234 -m "beta"',
        ],
      },
    ],
  },
  {
    name: 'Collaboration Hacks',
    icon: 'tea',
    description: 'Working with others without losing your mind',
    commands: [
      {
        name: 'fetch vs pull',
        command: 'git fetch / git pull',
        description: 'Understanding the difference saves headaches',
        whatItDoes: 'fetch downloads new data from the remote and updates your remote-tracking branches (like origin/main), but your local branch stays untouched. pull does a fetch and then merges. If you want to review what changed before merging, use fetch. If you just want the latest, pull.',
        beforeState: [
          { name: 'local main', content: 'commit: a1b2c3d\n// your local is behind', status: 'modified' },
          { name: 'origin/main', content: 'commits: a1b2c3d, e4f5g6h, i7j8k9l\n// remote has 2 new commits', status: 'new' },
        ],
        afterState: [
          { name: 'after fetch', content: 'local main: a1b2c3d (unchanged!)\norigin/main: i7j8k9l (updated)\n// you can inspect before merging', status: 'modified' },
          { name: 'after pull', content: 'local main: i7j8k9l (merged!)\norigin/main: i7j8k9l\n// local is now up to date', status: 'new' },
        ],
        terminalOutput: [
          '# FETCH — download only, don\'t merge:',
          '$ git fetch origin',
          'remote: Counting objects: 5, done.',
          'From github.com:you/project',
          '   a1b2c3d..i7j8k9l  main -> origin/main',
          '',
          '# Now you can inspect:',
          '$ git log main..origin/main  # what\'s new?',
          '$ git diff main origin/main  # what changed?',
          '',
          '# Happy with it? Merge manually:',
          '$ git merge origin/main',
          '',
          '# PULL — fetch + merge in one step:',
          '$ git pull origin main',
          '',
          '# Pro tip: git pull --rebase',
          '# Rebases your local commits on top of remote.',
          '# Cleaner history than merge.',
        ],
      },
      {
        name: 'remote',
        command: 'git remote -v / add / rename',
        description: 'Manage connections to other repositories',
        whatItDoes: 'A remote is a URL alias pointing to another copy of the repo, usually on GitHub or GitLab. Most repos have "origin" by default. If you forked a project, you\'d add "upstream" pointing to the original repo, so you can pull in their changes and push to your fork.',
        beforeState: [
          { name: 'remotes', content: 'origin → your-fork (fetch/push)', status: 'modified' },
        ],
        afterState: [
          { name: 'remotes', content: 'origin   → your-fork (fetch/push)\nupstream → original-repo (fetch/push)', status: 'new' },
        ],
        terminalOutput: [
          '$ git remote -v',
          'origin  git@github.com:you/project.git (fetch)',
          'origin  git@github.com:you/project.git (push)',
          '',
          '$ git remote add upstream git@github.com:org/project.git',
          '',
          '$ git remote -v',
          'origin    git@github.com:you/project.git (fetch)',
          'origin    git@github.com:you/project.git (push)',
          'upstream  git@github.com:org/project.git (fetch)',
          'upstream  git@github.com:org/project.git (push)',
          '',
          '# Keep your fork up to date:',
          '$ git fetch upstream',
          '$ git merge upstream/main',
          '$ git push origin main',
        ],
      },
    ],
  },
];
