import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GitCommand } from '../../data/git-commands';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-command-panel',
  templateUrl: './command-panel.html',
  styleUrl: './command-panel.scss',
})
export class CommandPanel {
  @Input() commands: GitCommand[] = [];
  @Input() activeIndex = 0;
  @Input() categoryIndex = 0;
  @Output() commandSelected = new EventEmitter<number>();

  constructor(public progress: ProgressService) {}

  select(index: number) {
    this.commandSelected.emit(index);
  }
}
