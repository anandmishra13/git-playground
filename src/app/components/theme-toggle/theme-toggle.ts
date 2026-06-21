import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
      <span class="toggle-track" [class.dark]="theme.isDark()">
        <span class="toggle-thumb" [class.dark]="theme.isDark()">
          {{ theme.isDark() ? '&#9789;' : '&#9788;' }}
        </span>
      </span>
    </button>
  `,
  styles: `
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
    }

    .toggle-track {
      width: 48px;
      height: 26px;
      border-radius: 13px;
      background: var(--border);
      position: relative;
      transition: background 0.25s;

      &.dark {
        background: var(--accent);
      }
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: transform 0.25s, background 0.25s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);

      &.dark {
        transform: translateX(22px);
      }
    }
  `,
})
export class ThemeToggle {
  constructor(public theme: ThemeService) {}
}
