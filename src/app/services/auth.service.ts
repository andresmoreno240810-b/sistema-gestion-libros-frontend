
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

export interface RespuestaLogin {
  message: string;
  token: string;
  user: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((respuesta) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('auth_token', respuesta.token);
            localStorage.setItem(
              'auth_user',
              JSON.stringify(respuesta.user),
            );
          }
        }),
      );
  }
}
