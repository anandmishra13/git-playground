import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GitCommand } from '../../data/git-commands';

@Component({
  selector: 'app-command-panel',
  templateUrl: './command-panel.html',
  styleUrl: './command-panel.scss',
})
export class CommandPanel {
  @Input() commands: GitCommand[] = [];
  @Input() activeIndex = 0;
  @Output() commandSelected = new EventEmitter<number>();

  select(index: number) {
    this.commandSelected.emit(index);
  }
}
