import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { LectorDashboard } from './lector-dashboard/lector-dashboard';
import { Libros } from './libros/libros';
import { LibroFormulario } from './libro-formulario/libro-formulario';
import { Categorias } from './categorias/categorias';
import { Autores } from './autores/autores';
import { Editoriales } from './editoriales/editoriales';
import { RegistroPrestamo } from './registro-prestamo/registro-prestamo';
import { Prestamos } from './prestamos/prestamos';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'lector/dashboard',
        component: LectorDashboard
    },

    {
        path: 'libros',
        component: Libros
    },

    {
        path: 'libros/nuevo',
        component: LibroFormulario
    },

    {
        path: 'categorias',
        component: Categorias
    },

    {
        path: 'autores',
        component: Autores
    },
    {
        path: 'editoriales',
        component: Editoriales
    },

    {
        path: 'prestamos/nuevo',
        component: RegistroPrestamo
    },

    {
        path: 'prestamos',
        component: Prestamos
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];