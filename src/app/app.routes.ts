import { type Routes } from '@angular/router';
import { Home } from './pages/home';
import { Impressum } from './pages/legal/impressum';
import { Datenschutz } from './pages/legal/datenschutz';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'impressum', component: Impressum },
  { path: 'datenschutz', component: Datenschutz },
  { path: '**', redirectTo: '' },
];
