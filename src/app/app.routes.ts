import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Playground } from './components/playground/playground';
import { WorldView } from './components/world-view/world-view';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'world/:id', component: WorldView },
  { path: 'playground/:categoryId/:commandId', component: Playground },
  { path: '**', redirectTo: '' },
];
