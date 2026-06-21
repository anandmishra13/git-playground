import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { COMMAND_CATEGORIES } from '../../data/git-commands';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

interface FloatingNode {
  label: string;
  categoryIdx: number;
  commandIdx: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  hovered: boolean;
  scale: number;
  targetScale: number;
  category: string;
}

interface Edge {
  from: number;
  to: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  phase: number;
  drift: number;
}

const PALETTE = ['#e07a5f', '#81b29a', '#f2cc8f', '#5b8fb9', '#9b8fb4', '#e63946'];

@Component({
  selector: 'app-home',
  imports: [ThemeToggle],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('graphCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  categories = COMMAND_CATEGORIES;
  nodes: FloatingNode[] = [];
  edges: Edge[] = [];
  stars: Star[] = [];
  private animId = 0;
  private frameCount = 0;
  private mouse = { x: -1000, y: -1000 };
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private boundMouseMove: any;
  private boundClick: any;
  private boundResize: any;

  constructor(private router: Router, private zone: NgZone, private theme: ThemeService) {}

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;

    setTimeout(() => {
      this.sizeCanvas();
      this.buildStars();
      this.buildGraph();
      this.setupEvents();
      this.zone.runOutsideAngular(() => this.tick());
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('click', this.boundClick);
    window.removeEventListener('resize', this.boundResize);
  }

  private sizeCanvas() {
    this.w = this.canvas.parentElement!.clientWidth;
    this.h = this.canvas.parentElement!.clientHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
  }

  private buildStars() {
    this.stars = [];
    const count = Math.floor((this.w * this.h) / 4000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 0.5 + Math.random() * 2,
        speed: 0.08 + Math.random() * 0.25,
        brightness: Math.random(),
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.15,
      });
    }
  }

  private buildGraph() {
    this.nodes = [];
    this.edges = [];

    const cx = this.w / 2;
    const cy = this.h / 2;
    const spread = Math.min(this.w, this.h) * 0.35;

    this.categories.forEach((cat, ci) => {
      const catAngle = (ci / this.categories.length) * Math.PI * 2 - Math.PI / 2;
      const catCx = cx + Math.cos(catAngle) * spread * 0.5;
      const catCy = cy + Math.sin(catAngle) * spread * 0.5;

      cat.commands.forEach((cmd, cmi) => {
        const jitter = 40 + Math.random() * spread * 0.6;
        const a = Math.random() * Math.PI * 2;
        const label = 'git ' + cmd.name;
        this.ctx.font = "500 13px 'JetBrains Mono', monospace";
        const textW = this.ctx.measureText(label).width;
        this.nodes.push({
          label,
          categoryIdx: ci,
          commandIdx: cmi,
          x: catCx + Math.cos(a) * jitter,
          y: catCy + Math.sin(a) * jitter,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: textW / 2 + 18,
          color: PALETTE[ci % PALETTE.length],
          hovered: false,
          scale: 1,
          targetScale: 1,
          category: cat.name,
        });
      });
    });

    let offset = 0;
    this.categories.forEach(cat => {
      for (let i = 0; i < cat.commands.length; i++) {
        for (let j = i + 1; j < cat.commands.length; j++) {
          this.edges.push({ from: offset + i, to: offset + j });
        }
      }
      offset += cat.commands.length;
    });

    for (let i = 0; i < 6; i++) {
      const a = Math.floor(Math.random() * this.nodes.length);
      let b = Math.floor(Math.random() * this.nodes.length);
      while (b === a) b = Math.floor(Math.random() * this.nodes.length);
      if (this.nodes[a].categoryIdx !== this.nodes[b].categoryIdx) {
        this.edges.push({ from: a, to: b });
      }
    }
  }

  private setupEvents() {
    this.boundMouseMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      let hit = false;
      for (const n of this.nodes) {
        const dx = this.mouse.x - n.x;
        const dy = this.mouse.y - n.y;
        n.hovered = Math.sqrt(dx * dx + dy * dy) < n.radius * n.scale;
        if (n.hovered) hit = true;
        n.targetScale = n.hovered ? 1.35 : 1;
      }
      this.canvas.style.cursor = hit ? 'pointer' : 'default';
    };

    this.boundClick = () => {
      const node = this.nodes.find(n => n.hovered);
      if (node) {
        this.zone.run(() => {
          this.router.navigate(['/playground', node.categoryIdx, node.commandIdx]);
        });
      }
    };

    this.boundResize = () => {
      this.sizeCanvas();
    };

    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('click', this.boundClick);
    window.addEventListener('resize', this.boundResize);
  }

  private tick() {
    this.frameCount++;
    this.physics();
    this.draw();
    this.animId = requestAnimationFrame(() => this.tick());
  }

  private physics() {
    const pad = 50;

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.radius + b.radius) * 1.4;

        if (dist < minDist) {
          const f = (minDist - dist) * 0.004;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
    }

    for (const e of this.edges) {
      const a = this.nodes[e.from];
      const b = this.nodes[e.to];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = 160;
      const f = (dist - target) * 0.0004;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    const cx = this.w / 2;
    const cy = this.h / 2;

    for (const n of this.nodes) {
      n.vx += (cx - n.x) * 0.0001;
      n.vy += (cy - n.y) * 0.0001;

      if (this.mouse.x > 0) {
        const dx = n.x - this.mouse.x;
        const dy = n.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 1 && !n.hovered) {
          const f = (100 - dist) * 0.001;
          n.vx += (dx / dist) * f;
          n.vy += (dy / dist) * f;
        }
      }

      n.vx *= 0.96;
      n.vy *= 0.96;
      n.x += n.vx;
      n.y += n.vy;
      n.scale += (n.targetScale - n.scale) * 0.18;

      if (n.x - n.radius < pad) { n.x = pad + n.radius; n.vx *= -0.4; }
      if (n.x + n.radius > this.w - pad) { n.x = this.w - pad - n.radius; n.vx *= -0.4; }
      if (n.y - 18 < pad) { n.y = pad + 18; n.vy *= -0.4; }
      if (n.y + 18 > this.h - pad) { n.y = this.h - pad - 18; n.vy *= -0.4; }
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    const isDark = this.theme.isDark();
    const t = this.frameCount * 0.02;
    for (const s of this.stars) {
      const twinkle = 0.3 + 0.7 * ((Math.sin(t * s.speed * 3 + s.phase) + 1) / 2);
      const alpha = (isDark ? 0.6 : 0.18) * twinkle;
      s.y -= s.speed;
      s.x += s.drift;
      if (s.y < -5) { s.y = this.h + 5; s.x = Math.random() * this.w; }
      if (s.x < -5) s.x = this.w + 5;
      if (s.x > this.w + 5) s.x = -5;
      const starColor = isDark ? '255, 255, 255' : '120, 100, 80';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + starColor + ', ' + alpha + ')';
      ctx.fill();
      if (s.size > 1.3 && twinkle > 0.7) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + starColor + ', ' + (alpha * 0.15) + ')';
        ctx.fill();
      }
    }

    for (const e of this.edges) {
      const a = this.nodes[e.from];
      const b = this.nodes[e.to];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.max(0.03, Math.min(0.15, 1 - dist / 400));

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(180, 160, 140, ' + alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (const n of this.nodes) {
      const s = n.scale;
      const r = n.radius * s;
      const pillH = 38 * s;
      const fontSize = 13 * s;

      ctx.save();
      ctx.translate(n.x, n.y);

      ctx.beginPath();
      ctx.roundRect(-r, -pillH / 2, r * 2, pillH, pillH / 2);

      const pillBg = getComputedStyle(document.documentElement).getPropertyValue('--pill-bg').trim();
      if (n.hovered) {
        ctx.shadowColor = n.color + '88';
        ctx.shadowBlur = 28 * s;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = n.color;
      } else {
        ctx.fillStyle = pillBg || '#fff8f0';
      }
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = n.hovered ? n.color : n.color + '66';
      ctx.lineWidth = n.hovered ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = n.hovered ? '#fff' : n.color;
      ctx.font = (n.hovered ? '700 ' : '500 ') + fontSize + "px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, 0, 0);

      if (n.hovered) {
        const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
        ctx.fillStyle = mutedColor || '#9a8572';
        ctx.font = '500 ' + (10 * s) + "px 'Inter', sans-serif";
        ctx.fillText(n.category, 0, pillH / 2 + 16 * s);
      }

      ctx.restore();
    }
  }
}
