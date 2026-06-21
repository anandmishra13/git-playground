import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { GitCommand, GraphState, FileState } from '../../data/git-commands';

interface RenderedLine {
  text: string;
  isCommand: boolean;
  isComment: boolean;
  isEmpty: boolean;
}

@Component({
  selector: 'app-visual-area',
  templateUrl: './visual-area.html',
  styleUrl: './visual-area.scss',
})
export class VisualArea implements OnChanges, AfterViewChecked, OnDestroy {
  @Input() command!: GitCommand;
  @Input() showAfter = false;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('terminalBody') terminalBodyRef!: ElementRef<HTMLDivElement>;

  files: FileState[] = [];
  terminal: string[] = [];
  renderedLines: RenderedLine[] = [];
  typing = false;
  done = false;
  graph: GraphState | null = null;
  private needsRedraw = false;
  private typeTimer: any = null;
  private graphAnimId = 0;
  private graphProgress = 1;

  private lineIdx = 0;
  private charIdx = 0;

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
    this.needsRedraw = true;
  }

  ngOnDestroy() {
    this.stopTyping();
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);
  }

  ngAfterViewChecked() {
    if (this.needsRedraw && this.graph && this.canvasRef) {
      this.animateGraph();
      this.needsRedraw = false;
    }
  }

  private stopTyping() {
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
  }

  private updateState() {
    this.stopTyping();
    if (this.graphAnimId) cancelAnimationFrame(this.graphAnimId);

    if (this.showAfter) {
      this.files = this.command.afterState;
      this.terminal = this.command.terminalOutput;
      this.renderedLines = [];
      this.lineIdx = 0;
      this.charIdx = 0;
      this.typing = true;
      this.done = false;
      this.scheduleNext();
      this.graph = this.command.afterGraph || this.command.gitGraph || null;
    } else {
      this.files = this.command.beforeState;
      this.terminal = [];
      this.renderedLines = [];
      this.typing = false;
      this.done = false;
      this.graph = this.command.gitGraph || null;
    }
    this.graphProgress = 0;
  }

  replay() {
    this.stopTyping();
    this.renderedLines = [];
    this.lineIdx = 0;
    this.charIdx = 0;
    this.typing = true;
    this.done = false;
    this.scheduleNext();
  }

  private scheduleNext() {
    if (this.lineIdx >= this.terminal.length) {
      this.typing = false;
      this.done = true;
      return;
    }

    const line = this.terminal[this.lineIdx];
    const isCmdLine = line.trimStart().startsWith('$');

    if (isCmdLine) {
      if (this.charIdx === 0) {
        this.renderedLines.push({
          text: '',
          isCommand: true,
          isComment: false,
          isEmpty: false,
        });
      }
      const current = this.renderedLines[this.renderedLines.length - 1];
      if (this.charIdx < line.length) {
        current.text = line.substring(0, this.charIdx + 1);
        this.charIdx++;
        this.scrollTerminal();
        const delay = 25 + Math.random() * 35;
        this.typeTimer = setTimeout(() => this.scheduleNext(), delay);
      } else {
        this.lineIdx++;
        this.charIdx = 0;
        this.typeTimer = setTimeout(() => this.scheduleNext(), 300);
      }
    } else {
      this.renderedLines.push({
        text: line,
        isCommand: false,
        isComment: line.trimStart().startsWith('#'),
        isEmpty: line === '',
      });
      this.lineIdx++;
      this.charIdx = 0;
      this.scrollTerminal();
      const nextLine = this.lineIdx < this.terminal.length ? this.terminal[this.lineIdx] : null;
      const nextIsCmd = nextLine?.trimStart().startsWith('$');
      const delay = nextIsCmd ? 400 : 40;
      this.typeTimer = setTimeout(() => this.scheduleNext(), delay);
    }
  }

  private scrollTerminal() {
    setTimeout(() => {
      if (this.terminalBodyRef) {
        const el = this.terminalBodyRef.nativeElement;
        el.scrollTop = el.scrollHeight;
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
