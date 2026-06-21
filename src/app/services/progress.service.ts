import { Injectable, signal, computed } from '@angular/core';
import { COMMAND_CATEGORIES } from '../data/git-commands';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private explored = signal<Set<string>>(new Set());

  totalCommands = COMMAND_CATEGORIES.reduce((sum, cat) => sum + cat.commands.length, 0);
  exploredCount = computed(() => this.explored().size);
  percentage = computed(() => Math.round((this.exploredCount() / this.totalCommands) * 100));

  constructor() {
    const saved = localStorage.getItem('git-pg-explored');
    if (saved) {
      try { this.explored.set(new Set(JSON.parse(saved))); } catch {}
    }
  }

  markExplored(categoryIdx: number, commandIdx: number) {
    const key = categoryIdx + ':' + commandIdx;
    const next = new Set(this.explored());
    if (!next.has(key)) {
      next.add(key);
      this.explored.set(next);
      localStorage.setItem('git-pg-explored', JSON.stringify([...next]));
    }
  }

  isExplored(categoryIdx: number, commandIdx: number): boolean {
    return this.explored().has(categoryIdx + ':' + commandIdx);
  }
}
