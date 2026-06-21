import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { METRO_LINES, METRO_STATIONS, MetroStation, MetroLine, getLineColor } from '../../data/metro-map';
import { COMMAND_CATEGORIES } from '../../data/git-commands';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-home',
  imports: [ThemeToggle],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private cdr = inject(ChangeDetectorRef);
  lines = METRO_LINES;
  stations = METRO_STATIONS;
  hoveredStation: MetroStation | null = null;
  legendLines = METRO_LINES;

  private animId = 0;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;

  private camera = { x: 0, y: 0, zoom: 1 };
  private targetCamera = { x: 0, y: 0, zoom: 1 };
  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private cameraStart = { x: 0, y: 0 };
  private mouse = { x: -1000, y: -1000 };

  private boundMouseDown: any;
  private boundMouseMove: any;
  private boundMouseUp: any;
  private boundWheel: any;
  private boundResize: any;
  private boundClick: any;
  private boundTouchStart: any;
  private boundTouchMove: any;
  private boundTouchEnd: any;

  private pulsePhase = 0;

  constructor(private router: Router, private zone: NgZone, private theme: ThemeService) {}

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;

    setTimeout(() => {
      this.sizeCanvas();
      this.centerMap();
      this.setupEvents();
      this.zone.runOutsideAngular(() => this.tick());
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('wheel', this.boundWheel);
    this.canvas.removeEventListener('click', this.boundClick);
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
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

  private centerMap() {
    if (this.stations.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of this.stations) {
      minX = Math.min(minX, s.x);
      maxX = Math.max(maxX, s.x);
      minY = Math.min(minY, s.y);
      maxY = Math.max(maxY, s.y);
    }
    const mapW = maxX - minX + 200;
    const mapH = maxY - minY + 200;
    const zoom = Math.min(this.w / mapW, this.h / mapH, 1.2) * 0.85;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    this.camera.x = this.w / 2 - cx * zoom;
    this.camera.y = this.h / 2 - cy * zoom;
    this.camera.zoom = zoom;
    this.targetCamera = { ...this.camera };
  }

  private setupEvents() {
    this.boundMouseDown = (e: MouseEvent) => {
      this.dragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.cameraStart = { x: this.targetCamera.x, y: this.targetCamera.y };
      this.canvas.style.cursor = 'grabbing';
    };

    this.boundMouseMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      if (this.dragging) {
        this.targetCamera.x = this.cameraStart.x + (e.clientX - this.dragStart.x);
        this.targetCamera.y = this.cameraStart.y + (e.clientY - this.dragStart.y);
      } else {
        const worldPos = this.screenToWorld(this.mouse.x, this.mouse.y);
        const prev = this.hoveredStation;
        this.hoveredStation = this.findStation(worldPos.x, worldPos.y);
        this.canvas.style.cursor = this.hoveredStation ? 'pointer' : 'grab';
        if (prev !== this.hoveredStation) {
          this.zone.run(() => this.cdr.detectChanges());
        }
      }
    };

    this.boundMouseUp = () => {
      this.dragging = false;
      this.canvas.style.cursor = this.hoveredStation ? 'pointer' : 'grab';
    };

    this.boundClick = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - this.dragStart.x);
      const dy = Math.abs(e.clientY - this.dragStart.y);
      if (dx > 5 || dy > 5) return;

      if (this.hoveredStation) {
        this.navigateToStation(this.hoveredStation);
      }
    };

    this.boundWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const oldZoom = this.targetCamera.zoom;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.3, Math.min(3, oldZoom * factor));

      this.targetCamera.x = mx - (mx - this.targetCamera.x) * (newZoom / oldZoom);
      this.targetCamera.y = my - (my - this.targetCamera.y) * (newZoom / oldZoom);
      this.targetCamera.zoom = newZoom;
    };

    this.boundTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.dragging = true;
        this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.cameraStart = { x: this.targetCamera.x, y: this.targetCamera.y };
      }
    };

    this.boundTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (this.dragging && e.touches.length === 1) {
        this.targetCamera.x = this.cameraStart.x + (e.touches[0].clientX - this.dragStart.x);
        this.targetCamera.y = this.cameraStart.y + (e.touches[0].clientY - this.dragStart.y);
      }
    };

    this.boundTouchEnd = () => {
      this.dragging = false;
    };

    this.boundResize = () => {
      this.sizeCanvas();
      this.centerMap();
    };

    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
    this.canvas.addEventListener('click', this.boundClick);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd);
    window.addEventListener('resize', this.boundResize);
  }

  private screenToWorld(sx: number, sy: number) {
    return {
      x: (sx - this.camera.x) / this.camera.zoom,
      y: (sy - this.camera.y) / this.camera.zoom,
    };
  }

  private findStation(wx: number, wy: number): MetroStation | null {
    const hitRadius = 20 / this.camera.zoom;
    for (const s of this.stations) {
      const dx = wx - s.x;
      const dy = wy - s.y;
      const r = s.major ? hitRadius * 1.5 : hitRadius;
      if (dx * dx + dy * dy < r * r) return s;
    }
    return null;
  }

  private navigateToStation(station: MetroStation) {
    const catIdx = this.findCommandInCategories(station.id);
    if (catIdx) {
      this.zone.run(() => {
        this.router.navigate(['/playground', catIdx.cat, catIdx.cmd]);
      });
    } else {
      this.targetCamera.zoom = Math.min(2, this.targetCamera.zoom * 1.5);
      const screenX = station.x * this.targetCamera.zoom;
      const screenY = station.y * this.targetCamera.zoom;
      this.targetCamera.x = this.w / 2 - screenX;
      this.targetCamera.y = this.h / 2 - screenY;
    }
  }

  private findCommandInCategories(stationId: string): { cat: number; cmd: number } | null {
    const nameMap: Record<string, string> = {
      'init': 'init', 'clone': 'clone', 'config-user': 'config',
      'status': 'status & diff', 'add': 'add & commit', 'commit': 'add & commit',
      'push': 'push', 'pull': 'pull', 'merge': 'merge',
      'merge-conflicts': 'merge conflicts', 'branch': 'branch & switch',
      'switch': 'branch & switch', 'switch-create': 'branch & switch',
      'commit-amend': 'amend', 'rebase': 'rebase',
      'rebase-interactive': 'interactive rebase', 'reset-soft': 'reset',
      'reset-mixed': 'reset', 'reset-hard': 'reset',
      'revert': 'revert', 'reflog': 'reflog', 'stash': 'stash',
      'bisect': 'bisect', 'cherry-pick': 'cherry-pick', 'blame': 'blame',
      'remote-add': 'remote', 'log-graph': 'log (power mode)',
      'tag': 'tag', 'worktree-add': 'worktree', 'clean': 'clean',
      'gitignore': '.gitignore',
    };

    const cmdName = nameMap[stationId];
    if (!cmdName) return null;

    for (let ci = 0; ci < COMMAND_CATEGORIES.length; ci++) {
      for (let cmi = 0; cmi < COMMAND_CATEGORIES[ci].commands.length; cmi++) {
        if (COMMAND_CATEGORIES[ci].commands[cmi].name === cmdName) {
          return { cat: ci, cmd: cmi };
        }
      }
    }
    return null;
  }

  private tick() {
    this.pulsePhase += 0.03;
    this.camera.x += (this.targetCamera.x - this.camera.x) * 0.12;
    this.camera.y += (this.targetCamera.y - this.camera.y) * 0.12;
    this.camera.zoom += (this.targetCamera.zoom - this.camera.zoom) * 0.12;
    this.draw();
    this.animId = requestAnimationFrame(() => this.tick());
  }

  private draw() {
    const ctx = this.ctx;
    const z = this.camera.zoom;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(z, z);

    this.drawLines(ctx, z);
    this.drawStations(ctx, z);

    ctx.restore();
  }

  private drawLines(ctx: CanvasRenderingContext2D, z: number) {
    for (const line of this.lines) {
      const stationObjs = line.stations
        .map(sid => this.stations.find(s => s.id === sid))
        .filter(Boolean) as MetroStation[];

      if (stationObjs.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 5 / z;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = stationObjs.map(s => ({ x: s.x, y: s.y }));
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;

        if (Math.abs(curr.y - prev.y) > 20) {
          ctx.lineTo(midX, prev.y);
          ctx.lineTo(midX, curr.y);
          ctx.lineTo(curr.x, curr.y);
        } else {
          ctx.lineTo(curr.x, curr.y);
        }
      }
      ctx.stroke();
    }
  }

  private drawStations(ctx: CanvasRenderingContext2D, z: number) {
    const isDark = this.theme.isDark();
    const bgColor = isDark ? '#242434' : '#fff8f0';
    const textColor = isDark ? '#e2ddd5' : '#3d2c1e';
    const mutedColor = isDark ? '#6e665c' : '#9a8572';

    for (const station of this.stations) {
      const isHovered = this.hoveredStation === station;
      const lineColor = getLineColor(station.lineIds[0]);
      const r = station.major ? 8 : 5;
      const pulse = station.major ? Math.sin(this.pulsePhase + station.x * 0.01) * 0.15 + 1 : 1;

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(station.x, station.y, (r + 8) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = lineColor + '22';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(station.x, station.y, r * pulse + 2, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = (station.major ? 3 : 2) / z;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(station.x, station.y, (r - 2) * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? lineColor : (station.major ? lineColor : lineColor + '88');
      ctx.fill();

      if (station.lineIds.length > 1) {
        ctx.beginPath();
        ctx.arc(station.x, station.y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? '#ffffff44' : '#00000022';
        ctx.lineWidth = 2 / z;
        ctx.setLineDash([3 / z, 3 / z]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const showLabel = z > 0.5 || station.major;
      if (showLabel) {
        const fontSize = Math.max(9, Math.min(12, 11 / z));
        ctx.font = (station.major ? '600 ' : '400 ') + fontSize + "px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHovered ? lineColor : (station.major ? textColor : mutedColor);
        ctx.fillText(station.name, station.x, station.y + r + 8);
      }

      if (isHovered && z > 0.4) {
        ctx.font = "10px 'Inter', sans-serif";
        ctx.fillStyle = mutedColor;
        ctx.fillText(station.description, station.x, station.y + r + 24);
      }
    }
  }

  zoomIn() {
    this.targetCamera.zoom = Math.min(3, this.targetCamera.zoom * 1.3);
  }

  zoomOut() {
    this.targetCamera.zoom = Math.max(0.3, this.targetCamera.zoom * 0.7);
  }

  resetView() {
    this.centerMap();
  }

  filterLine(lineId: string) {
    const lineStations = this.stations.filter(s => s.lineIds.includes(lineId));
    if (lineStations.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of lineStations) {
      minX = Math.min(minX, s.x);
      maxX = Math.max(maxX, s.x);
      minY = Math.min(minY, s.y);
      maxY = Math.max(maxY, s.y);
    }

    const mapW = maxX - minX + 300;
    const mapH = maxY - minY + 200;
    const zoom = Math.min(this.w / mapW, this.h / mapH) * 0.85;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    this.targetCamera.x = this.w / 2 - cx * zoom;
    this.targetCamera.y = this.h / 2 - cy * zoom;
    this.targetCamera.zoom = zoom;
  }
}
