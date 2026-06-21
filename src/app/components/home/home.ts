import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WORLDS, World } from '../../data/worlds';
import { XpService } from '../../services/xp.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-home',
  imports: [ThemeToggle],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private router = inject(Router);
  xp = inject(XpService);
  worlds = WORLDS;
  expandedWorldId = 1;
  searchOpen = false;
  searchQuery = '';
  searchResults: { worldId: number; levelIdx: number; command: string }[] = [];

  toggleWorld(worldId: number) {
    this.expandedWorldId = this.expandedWorldId === worldId ? 0 : worldId;
  }

  openCommand(worldId: number, command: string) {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return;
    let catIdx = 0;
    let cmdIdx = 0;
    let found = false;
    for (let li = 0; li < world.levels.length && !found; li++) {
      for (let ci = 0; ci < world.levels[li].commands.length && !found; ci++) {
        if (world.levels[li].commands[ci] === command) {
          found = true;
        }
        if (!found) cmdIdx++;
      }
    }
    catIdx = worldId - 1;
    this.router.navigate(['/playground', catIdx, cmdIdx]);
  }

  navigateToWorld(world: World) {
    if (!this.xp.isWorldUnlocked(world.id)) return;
    this.router.navigate(['/world', world.id]);
  }

  getWorldProgress(worldId: number) {
    return this.xp.worldProgress(worldId);
  }

  isUnlocked(worldId: number) {
    return this.xp.isWorldUnlocked(worldId);
  }

  isCompleted(worldId: number) {
    return this.xp.isWorldComplete(worldId);
  }

  progressPercent(worldId: number): number {
    const p = this.getWorldProgress(worldId);
    return p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  }

  getCommandIcon(cmd: string): string {
    const m = this.xp.getCommandMastery(cmd);
    if (m === 'mastered') return '★';
    if (m === 'explored') return '◉';
    if (m === 'seen') return '◎';
    return '○';
  }

  getCommandClass(cmd: string): string {
    return this.xp.getCommandMastery(cmd) || 'locked';
  }

  openSearch() {
    this.searchOpen = true;
    this.searchQuery = '';
    this.searchResults = [];
    setTimeout(() => {
      const el = document.querySelector('.search-input') as HTMLInputElement;
      if (el) el.focus();
    }, 50);
  }

  closeSearch() {
    this.searchOpen = false;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }
    const q = query.toLowerCase();
    this.searchResults = [];
    for (const world of WORLDS) {
      for (let li = 0; li < world.levels.length; li++) {
        for (const cmd of world.levels[li].commands) {
          if (cmd.toLowerCase().includes(q) || cmd.replace(/-/g, ' ').includes(q)) {
            this.searchResults.push({ worldId: world.id, levelIdx: li, command: cmd });
          }
        }
      }
    }
  }

  onSearchSelect(result: { worldId: number; command: string }) {
    this.closeSearch();
    this.expandedWorldId = result.worldId;
  }

  handleKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      if (this.searchOpen) this.closeSearch();
      else this.openSearch();
    }
    if (event.key === 'Escape' && this.searchOpen) {
      this.closeSearch();
    }
  }
}
