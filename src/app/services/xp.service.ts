import { Injectable, signal, computed } from '@angular/core';
import { WORLDS } from '../data/worlds';

export type MasteryTier = 'locked' | 'available' | 'seen' | 'explored' | 'mastered';

interface XpState {
  xp: number;
  streak: number;
  lastActive: string;
  commandMastery: Record<string, MasteryTier>;
  worldsCompleted: number[];
}

const STORAGE_KEY = 'git-pg-xp';

const LEVELS = [
  { min: 0, title: 'Git Newbie' },
  { min: 50, title: 'Git Newbie' },
  { min: 120, title: 'Git Newbie' },
  { min: 200, title: 'Git Newbie' },
  { min: 300, title: 'Git Newbie' },
  { min: 420, title: 'Committed Dev' },
  { min: 560, title: 'Committed Dev' },
  { min: 720, title: 'Committed Dev' },
  { min: 900, title: 'Committed Dev' },
  { min: 1100, title: 'Committed Dev' },
  { min: 1320, title: 'Committed Dev' },
  { min: 1560, title: 'Committed Dev' },
  { min: 1820, title: 'Branch Manager' },
  { min: 2100, title: 'Branch Manager' },
  { min: 2400, title: 'Branch Manager' },
  { min: 2720, title: 'Branch Manager' },
  { min: 3060, title: 'Branch Manager' },
  { min: 3420, title: 'Branch Manager' },
  { min: 3800, title: 'Branch Manager' },
  { min: 4200, title: 'Branch Manager' },
  { min: 4620, title: 'Branch Manager' },
  { min: 5060, title: 'Branch Manager' },
  { min: 5520, title: 'Merge Master' },
  { min: 6000, title: 'Merge Master' },
  { min: 6500, title: 'Merge Master' },
  { min: 7020, title: 'Merge Master' },
  { min: 7560, title: 'Merge Master' },
  { min: 8120, title: 'Merge Master' },
  { min: 8700, title: 'Merge Master' },
  { min: 9300, title: 'Merge Master' },
  { min: 9920, title: 'Merge Master' },
  { min: 10560, title: 'Merge Master' },
  { min: 11220, title: 'Git Wizard' },
  { min: 11900, title: 'Git Wizard' },
  { min: 12600, title: 'Git Wizard' },
  { min: 13320, title: 'Git Wizard' },
  { min: 14060, title: 'Git Wizard' },
  { min: 14820, title: 'Git Wizard' },
  { min: 15600, title: 'Git Wizard' },
  { min: 16400, title: 'Git Wizard' },
  { min: 17220, title: 'Git Wizard' },
  { min: 18060, title: 'Git Legend' },
];

@Injectable({ providedIn: 'root' })
export class XpService {
  private state = signal<XpState>(this.load());

  xp = computed(() => this.state().xp);
  streak = computed(() => this.state().streak);
  commandMastery = computed(() => this.state().commandMastery);
  worldsCompleted = computed(() => this.state().worldsCompleted);

  level = computed(() => {
    const xp = this.xp();
    let lvl = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].min) { lvl = i + 1; break; }
    }
    return lvl;
  });

  title = computed(() => {
    const idx = Math.min(this.level() - 1, LEVELS.length - 1);
    return LEVELS[idx].title;
  });

  nextLevelXp = computed(() => {
    const idx = this.level();
    if (idx >= LEVELS.length) return this.xp();
    return LEVELS[idx].min;
  });

  levelProgress = computed(() => {
    const lvl = this.level();
    const curr = LEVELS[lvl - 1].min;
    const next = lvl < LEVELS.length ? LEVELS[lvl].min : curr + 1000;
    return Math.min(1, (this.xp() - curr) / (next - curr));
  });

  masteredCount = computed(() => {
    const m = this.commandMastery();
    return Object.values(m).filter(t => t === 'mastered' || t === 'explored').length;
  });

  isWorldUnlocked(worldId: number): boolean {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world || world.unlockAfter === null) return true;
    return this.worldsCompleted().includes(world.unlockAfter);
  }

  isWorldComplete(worldId: number): boolean {
    return this.worldsCompleted().includes(worldId);
  }

  getCommandMastery(commandId: string): MasteryTier {
    return this.commandMastery()[commandId] || 'locked';
  }

  worldProgress(worldId: number): { done: number; total: number } {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return { done: 0, total: 0 };
    const allCmds = world.levels.flatMap(l => l.commands);
    const m = this.commandMastery();
    const done = allCmds.filter(c => m[c] === 'explored' || m[c] === 'mastered').length;
    return { done, total: allCmds.length };
  }

  addXp(amount: number) {
    this.update(s => ({ ...s, xp: s.xp + amount }));
  }

  markSeen(commandId: string) {
    this.updateMastery(commandId, 'seen', 10);
  }

  markExplored(commandId: string) {
    this.updateMastery(commandId, 'explored', 20);
  }

  markMastered(commandId: string) {
    this.updateMastery(commandId, 'mastered', 30);
  }

  completeWorld(worldId: number) {
    const s = this.state();
    if (!s.worldsCompleted.includes(worldId)) {
      this.update(st => ({
        ...st,
        worldsCompleted: [...st.worldsCompleted, worldId],
        xp: st.xp + 100,
      }));
    }
  }

  updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const s = this.state();
    if (s.lastActive === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = s.lastActive === yesterday ? s.streak + 1 : 1;

    this.update(st => ({
      ...st,
      streak: newStreak,
      lastActive: today,
      xp: st.xp + 5 * newStreak,
    }));
  }

  private updateMastery(commandId: string, tier: MasteryTier, xpGain: number) {
    const s = this.state();
    const current = s.commandMastery[commandId];
    const tierOrder: MasteryTier[] = ['locked', 'available', 'seen', 'explored', 'mastered'];
    const currentIdx = tierOrder.indexOf(current || 'locked');
    const newIdx = tierOrder.indexOf(tier);
    if (newIdx <= currentIdx) return;

    this.update(st => ({
      ...st,
      xp: st.xp + xpGain,
      commandMastery: { ...st.commandMastery, [commandId]: tier },
    }));
    this.updateStreak();
    this.checkWorldCompletion();
  }

  private checkWorldCompletion() {
    for (const world of WORLDS) {
      if (this.worldsCompleted().includes(world.id)) continue;
      const allCmds = world.levels.flatMap(l => l.commands);
      const m = this.commandMastery();
      const allExplored = allCmds.every(c => m[c] === 'explored' || m[c] === 'mastered');
      if (allExplored) this.completeWorld(world.id);
    }
  }

  private update(fn: (s: XpState) => XpState) {
    const next = fn(this.state());
    this.state.set(next);
    this.save(next);
  }

  private load(): XpState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { xp: 0, streak: 0, lastActive: '', commandMastery: {}, worldsCompleted: [] };
  }

  private save(s: XpState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
}
