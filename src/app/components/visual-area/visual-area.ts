import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewChecked, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { GitCommand, GraphState, FileState } from '../../data/git-commands';

interface RenderedLine {
  text: string;
  type: 'command' | 'output' | 'comment' | 'empty';
}

@Component({
  selector: 'app-visual-area',
  templateUrl: './visual-area.html',
  styleUrl: './visual-area.scss',
})
export class VisualArea implements OnChanges, AfterViewChecked, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  @Input() command!: GitCommand;
  @Input() showAfter = false;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('terminalBody') terminalBodyRef!: ElementRef<HTMLDivElement>;

  files: FileState[] = [];
  terminal: string[] = [];
  renderedLines: RenderedLine[] = [];
  typing = false;
  waiting = false;
  done = false;
  graph: GraphState | null = null;
  private needsRedraw = false;
  private timers: any[] = [];
  private graphAnimId = 0;
  private graphProgress = 1;
  private lineIdx = 0;
  private charIdx = 0;

  ngOnChanges(_: SimpleChanges) {
    this.updateState();
    this.needsRedraw = true;
  }

  ngOnDestroy() {
    this.clearTimers();
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);
  }

  ngAfterViewChecked() {
    if (this.needsRedraw && this.graph && this.canvasRef) {
      this.animateGraph();
      this.needsRedraw = false;
    }
  }

  private clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  private later(fn: () => void, ms: number) {
    this.timers.push(setTimeout(() => {
      fn();
      this.cdr.detectChanges();
    }, ms));
  }

  private updateState() {
    this.clearTimers();
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);

    if (this.showAfter) {
      this.files = this.command.afterState;
      this.terminal = this.command.terminalOutput;
      this.renderedLines = [];
      this.lineIdx = 0;
      this.charIdx = 0;
      this.typing = false;
      this.waiting = true;
      this.done = false;
      this.graph = this.command.afterGraph || this.command.gitGraph || null;
      this.later(() => {
        this.waiting = false;
        this.typing = true;
        this.typeNext();
      }, 1500);
    } else {
      this.files = this.command.beforeState;
      this.terminal = [];
      this.renderedLines = [];
      this.typing = false;
      this.waiting = false;
      this.done = false;
      this.graph = this.command.gitGraph || null;
    }
    this.graphProgress = 0;
  }

  replay() {
    this.clearTimers();
    this.renderedLines = [];
    this.lineIdx = 0;
    this.charIdx = 0;
    this.done = false;
    this.waiting = true;
    this.typing = false;
    this.later(() => {
      this.waiting = false;
      this.typing = true;
      this.typeNext();
    }, 1500);
  }

  private typeNext() {
    if (this.lineIdx >= this.terminal.length) {
      this.typing = false;
      this.done = true;
      return;
    }

    const line = this.terminal[this.lineIdx];
    const isCmd = line.trimStart().startsWith('$');

    if (isCmd) {
      const dollarIdx = line.indexOf('$');
      const prompt = line.substring(0, dollarIdx + 2);
      const cmd = line.substring(dollarIdx + 2);

      if (this.charIdx === 0) {
        this.renderedLines.push({ text: prompt, type: 'command' });
        this.scroll();
        this.charIdx = 1;
        this.later(() => this.typeNext(), 150);
        return;
      }

      const pos = this.charIdx - 1;
      if (pos < cmd.length) {
        const current = this.renderedLines[this.renderedLines.length - 1];
        current.text = prompt + cmd.substring(0, pos + 1);
        this.charIdx++;
        this.scroll();
        this.later(() => this.typeNext(), 30 + Math.random() * 40);
      } else {
        this.lineIdx++;
        this.charIdx = 0;
        this.later(() => this.typeNext(), 350);
      }
    } else {
      const type = line === '' ? 'empty' : line.trimStart().startsWith('#') ? 'comment' : 'output';
      this.renderedLines.push({ text: line, type });
      this.lineIdx++;
      this.charIdx = 0;
      this.scroll();

      const nextLine = this.lineIdx < this.terminal.length ? this.terminal[this.lineIdx] : null;
      const delay = nextLine?.trimStart().startsWith('$') ? 500 : 30;
      this.later(() => this.typeNext(), delay);
    }
  }

  private scroll() {
    setTimeout(() => {
      if (this.terminalBodyRef) {
        this.terminalBodyRef.nativeElement.scrollTop = this.terminalBodyRef.nativeElement.scrollHeight;
      }
    });
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
