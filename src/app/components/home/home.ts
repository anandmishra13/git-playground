import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { COMMAND_CATEGORIES } from '../../data/git-commands';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  categories = COMMAND_CATEGORIES;

  constructor(private router: Router) {}

  openCategory(categoryIndex: number) {
    this.router.navigate(['/playground', categoryIndex, 0]);
  }

  get totalCommands(): number {
    return this.categories.reduce((sum, cat) => sum + cat.commands.length, 0);
  }
}
