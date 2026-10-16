import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  iniciarSesion(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (respuesta) => {
        this.loading = false;

        const rolId = Number(respuesta.user.role_id);

        if (rolId === 1) {
          this.router.navigateByUrl('/dashboard');
        } else if (rolId === 2) {
          this.router.navigateByUrl('/lector/dashboard');
        } else {
          this.errorMessage =
            'Tu usuario no tiene un rol válido para acceder al sistema.';
        }
      },

      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'El correo o la contraseña son incorrectos.';
        } else if (error.status === 422) {
          this.errorMessage = 'Verifica que el correo y la contraseña sean válidos.';
        } else if (error.status === 0) {
          this.errorMessage =
            'No se pudo conectar con Laravel. Comprueba que el backend esté ejecutándose.';
        } else {
          this.errorMessage =
            error.error?.message || 'Ocurrió un error al iniciar sesión.';
        }
      },
    });
  }
}