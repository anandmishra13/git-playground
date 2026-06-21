import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { GitCommand, GraphState, GraphNode, GraphEdge, FileState } from '../../data/git-commands';

@Component({
  selector: 'app-visual-area',
  templateUrl: './visual-area.html',
  styleUrl: './visual-area.scss',
})
export class VisualArea implements OnChanges, AfterViewChecked {
  @Input() command!: GitCommand;
  @Input() showAfter = false;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  files: FileState[] = [];
  terminal: string[] = [];
  graph: GraphState | null = null;
  private needsRedraw = false;

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
    this.needsRedraw = true;
  }

  ngAfterViewChecked() {
    if (this.needsRedraw && this.graph && this.canvasRef) {
      this.drawGraph();
      this.needsRedraw = false;
    }
  }

  private updateState() {
    if (this.showAfter) {
      this.files = this.command.afterState;
      this.terminal = this.command.terminalOutput;
      this.graph = this.command.afterGraph || this.command.gitGraph || null;
    } else {
      this.files = this.command.beforeState;
      this.terminal = [];
      this.graph = this.command.gitGraph || null;
    }
  }

  getStatusClass(status?: string): string {
    return status || 'default';
  }

  getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      modified: 'M',
      new: 'A',
      deleted: 'D',
      renamed: 'R',
      staged: 'S',
      untracked: '?',
    };
    return labels[status || ''] || '';
  }

  isComment(line: string): boolean {
    return line.trimStart().startsWith('#');
  }

  isCommand(line: string): boolean {
    return line.trimStart().startsWith('$');
  }

  private drawGraph() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.graph) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const g = this.graph;

    g.edges.forEach(edge => {
      const from = g.nodes.find(n => n.id === edge.from);
      const to = g.nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 2.5;
      if (edge.dashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);

      if (from.y !== to.y) {
        const midX = (from.x + to.x) / 2;
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(midX, from.y, midX, to.y, to.x, to.y);
      } else {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      }
      ctx.stroke();
    });

    g.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.highlight ? 10 : 8, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (node.highlight) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (node.id === g.head) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 13, 0, Math.PI * 2);
        ctx.strokeStyle = '#f2cc8f';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.stroke();
      }

      ctx.fillStyle = '#3d2c1e';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.message, node.x, node.y + 28);

      ctx.fillStyle = '#9a8572';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(node.id.substring(0, 7), node.x, node.y - 18);
    });

    g.branches.forEach(branch => {
      const node = g.nodes.find(n => n.id === branch.pointsTo);
      if (!node) return;

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
    });
  }
}
