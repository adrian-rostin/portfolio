import { type Routes } from '@angular/router';
import { Home } from './pages/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: '**', redirectTo: '' },
];
