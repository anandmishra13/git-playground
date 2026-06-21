import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { GitCommand, GraphState, FileState } from '../../data/git-commands';

@Component({
  selector: 'app-visual-area',
  templateUrl: './visual-area.html',
  styleUrl: './visual-area.scss',
})
export class VisualArea implements OnChanges, AfterViewChecked, OnDestroy {
  @Input() command!: GitCommand;
  @Input() showAfter = false;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  files: FileState[] = [];
  terminal: string[] = [];
  visibleLines = 0;
  graph: GraphState | null = null;
  private needsRedraw = false;
  private typeTimer: any = null;
  private graphAnimId = 0;
  private graphProgress = 1;

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
    this.needsRedraw = true;
  }

  ngOnDestroy() {
    if (this.typeTimer) clearInterval(this.typeTimer);
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);
  }

  ngAfterViewChecked() {
    if (this.needsRedraw && this.graph && this.canvasRef) {
      this.animateGraph();
      this.needsRedraw = false;
    }
  }

  private updateState() {
    if (this.typeTimer) clearInterval(this.typeTimer);
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);

    if (this.showAfter) {
      this.files = this.command.afterState;
      this.terminal = this.command.terminalOutput;
      this.visibleLines = 0;
      this.startTyping();
      this.graph = this.command.afterGraph || this.command.gitGraph || null;
    } else {
      this.files = this.command.beforeState;
      this.terminal = [];
      this.visibleLines = 0;
      this.graph = this.command.gitGraph || null;
    }
    this.graphProgress = 0;
  }

  private startTyping() {
    if (!this.terminal.length) return;
    let i = 0;
    this.typeTimer = setInterval(() => {
      i++;
      this.visibleLines = i;
      if (i >= this.terminal.length) clearInterval(this.typeTimer);
    }, 65);
  }

  get displayedLines(): string[] {
    return this.terminal.slice(0, this.visibleLines);
  }

  get showCursor(): boolean {
    return this.showAfter && this.visibleLines < this.terminal.length;
  }

  getStatusClass(status?: string): string {
    return status || 'default';
  }

  getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      modified: 'M', new: 'A', deleted: 'D',
      renamed: 'R', staged: 'S', untracked: '?',
    };
    return labels[status || ''] || '';
  }

  isComment(line: string): boolean {
    return line.trimStart().startsWith('#');
  }

  isCommand(line: string): boolean {
    return line.trimStart().startsWith('$');
  }

  private animateGraph() {
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);
    this.graphProgress = 0;
    const start = performance.now();
    const duration = 500;

    const step = (now: number) => {
      this.graphProgress = Math.min(1, (now - start) / duration);
      this.drawGraph();
      if (this.graphProgress < 1) {
        this.graphAnimId = requestAnimationFrame(step);
      }
    };
    this.graphAnimId = requestAnimationFrame(step);
  }

  private ease(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private drawGraph() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.graph) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const g = this.graph;
    const p = this.ease(this.graphProgress);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e2ddd5' : '#3d2c1e';
    const mutedColor = isDark ? '#6e665c' : '#9a8572';

    g.edges.forEach(edge => {
      const from = g.nodes.find(n => n.id === edge.from);
      const to = g.nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      ctx.globalAlpha = p;
      ctx.beginPath();
      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 2.5;
      if (edge.dashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);

      const toX = from.x + (to.x - from.x) * p;
      const toY = from.y + (to.y - from.y) * p;

      if (from.y !== to.y) {
        const midX = (from.x + toX) / 2;
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(midX, from.y, midX, toY, toX, toY);
      } else {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(toX, toY);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    g.nodes.forEach((node, i) => {
      const delay = i * 0.12;
      const nodeP = this.ease(Math.max(0, Math.min(1, (this.graphProgress - delay) / (1 - delay))));
      const scale = nodeP;
      const r = (node.highlight ? 10 : 8) * scale;

      ctx.globalAlpha = nodeP;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (node.highlight && nodeP > 0.8) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (node.id === g.head && nodeP > 0.5) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 13 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#f2cc8f';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.stroke();
      }

      if (nodeP > 0.3) {
        ctx.fillStyle = textColor;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.message, node.x, node.y + 28);

        ctx.fillStyle = mutedColor;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(node.id.substring(0, 7), node.x, node.y - 18);
      }

      ctx.globalAlpha = 1;
    });

    g.branches.forEach(branch => {
      const node = g.nodes.find(n => n.id === branch.pointsTo);
      if (!node || p < 0.5) return;

      const branchAlpha = Math.min(1, (p - 0.5) * 2);
      ctx.globalAlpha = branchAlpha;

      const labelX = node.x;
      const labelY = node.y + 46;
      const text = branch.name;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      const metrics = ctx.measureText(text);
      const padX = 8;
      const padY = 4;

      ctx.fillStyle = branch.color + '22';
      ctx.strokeStyle = branch.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.roundRect(
        labelX - metrics.width / 2 - padX,
        labelY - 10 - padY,
        metrics.width + padX * 2,
        16 + padY * 2,
        4
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = branch.color;
      ctx.textAlign = 'center';
      ctx.fillText(text, labelX, labelY);
      ctx.globalAlpha = 1;
    });
  }
}
