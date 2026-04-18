import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { AdminUsers } from './pages/admin-users/admin-users';
import { Rutas } from './pages/rutas/rutas';
import { Reservas } from './pages/reservas/reservas';
import { ViajesCompartidos } from './pages/viajes-compartidos/viajes-compartidos';
import { authGuard } from './core/guards/auth.guard';
import { CrearViaje } from './pages/crear-viaje/crear-viaje';
import { Home } from './pages/home/home';

//AÑADIR  canActivate: [authGuard]  CUANDO EL BACKEND ESTE CONECTADO
export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile },
  { path: 'admin-users', component: AdminUsers, canActivate: [authGuard] },
  { path: 'crear-viaje', component: CrearViaje },
  { path: 'rutas', component: Rutas },
  { path: 'reservas', component: Reservas },
  { path: 'viajes-compartidos', component: ViajesCompartidos },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];