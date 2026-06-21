import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Playground } from './components/playground/playground';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'playground/:categoryId/:commandId', component: Playground },
  { path: '**', redirectTo: '' },
];
