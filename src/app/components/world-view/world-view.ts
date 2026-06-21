import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WORLDS, World } from '../../data/worlds';
import { XpService } from '../../services/xp.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-world-view',
  imports: [ThemeToggle],
  templateUrl: './world-view.html',
  styleUrl: './world-view.scss',
})
export class WorldView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  xp = inject(XpService);

  world = signal<World>(WORLDS[0]);
  worldId = signal(1);

  progress = computed(() => this.xp.worldProgress(this.worldId()));

  progressPercent = computed(() => {
    const p = this.progress();
    return p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id'], 10) || 1;
      const w = WORLDS.find(w => w.id === id);
      if (w) {
        this.world.set(w);
        this.worldId.set(id);
      }
      if (!this.xp.isWorldUnlocked(id)) {
        this.router.navigate(['/']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getCommandMastery(cmd: string) {
    return this.xp.getCommandMastery(cmd);
  }

  getNodeClass(cmd: string): string {
    const m = this.getCommandMastery(cmd);
    if (m === 'mastered') return 'mastered';
    if (m === 'explored') return 'explored';
    if (m === 'seen') return 'seen';
    return 'available';
  }

  getNodeIcon(cmd: string): string {
    const m = this.getCommandMastery(cmd);
    if (m === 'mastered') return '★';
    if (m === 'explored') return '◉';
    if (m === 'seen') return '◎';
    return '○';
  }

  openCommand(cmd: string) {
    this.xp.markSeen(cmd);
    this.router.navigate(['/playground', this.worldId() - 1, 0], {
      queryParams: { cmd }
    });
  }

  getNodeOffset(idx: number): number {
    const pattern = [0, 40, 60, 30, -10, 50, 20, 70, 10, 45];
    return pattern[idx % pattern.length];
  }
}
