import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { COMMAND_CATEGORIES, GitCommand, CommandCategory } from '../../data/git-commands';
import { VisualArea } from '../visual-area/visual-area';
import { CommandPanel } from '../command-panel/command-panel';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-playground',
  imports: [VisualArea, CommandPanel, ThemeToggle],
  templateUrl: './playground.html',
  styleUrl: './playground.scss',
})
export class Playground implements OnInit {
  categories = COMMAND_CATEGORIES;
  categoryIndex = signal(0);
  commandIndex = signal(0);
  showAfter = signal(false);

  category = computed(() => this.categories[this.categoryIndex()]);
  command = computed(() => this.category().commands[this.commandIndex()]);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const catIdx = parseInt(params['categoryId'], 10) || 0;
      const cmdIdx = parseInt(params['commandId'], 10) || 0;
      this.categoryIndex.set(catIdx);
      this.commandIndex.set(cmdIdx);
      this.showAfter.set(false);
    });
  }

  selectCommand(index: number) {
    this.showAfter.set(false);
    this.router.navigate(['/playground', this.categoryIndex(), index]);
  }

  selectCategory(index: number) {
    this.showAfter.set(false);
    this.router.navigate(['/playground', index, 0]);
  }

  runCommand() {
    this.showAfter.set(true);
  }

  resetCommand() {
    this.showAfter.set(false);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  nextCommand() {
    const cat = this.category();
    if (this.commandIndex() < cat.commands.length - 1) {
      this.selectCommand(this.commandIndex() + 1);
    } else if (this.categoryIndex() < this.categories.length - 1) {
      this.selectCategory(this.categoryIndex() + 1);
    }
  }

  prevCommand() {
    if (this.commandIndex() > 0) {
      this.selectCommand(this.commandIndex() - 1);
    } else if (this.categoryIndex() > 0) {
      const prevCat = this.categories[this.categoryIndex() - 1];
      this.categoryIndex.set(this.categoryIndex() - 1);
      this.router.navigate(['/playground', this.categoryIndex(), prevCat.commands.length - 1]);
    }
  }

  get hasNext(): boolean {
    return this.commandIndex() < this.category().commands.length - 1 ||
           this.categoryIndex() < this.categories.length - 1;
  }

  get hasPrev(): boolean {
    return this.commandIndex() > 0 || this.categoryIndex() > 0;
  }
}
