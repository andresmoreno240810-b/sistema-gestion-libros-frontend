import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lector {
  id: number;
  name: string;
  email: string;
}

export interface LibroDisponible {
  id: number;
  titulo: string;
  isbn: string;
  disponibles: number;
}

export interface OpcionesPrestamo {
  lectores: Lector[];
  libros: LibroDisponible[];
}

export interface LibroSeleccionado {
  libro_id: number;
  cantidad: number;
}

export interface CrearPrestamo {
  user_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  libros: LibroSeleccionado[];
}

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private obtenerHeaders(): HttpHeaders {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

    let headers = new HttpHeaders({
      Accept: 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  obtenerOpciones(): Observable<OpcionesPrestamo> {
    return this.http.get<OpcionesPrestamo>(
      `${this.apiUrl}/prestamos/opciones`,
      { headers: this.obtenerHeaders() },
    );
  }

  obtenerPrestamos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prestamos`, {
      headers: this.obtenerHeaders(),
    });
  }

  crearPrestamo(datos: CrearPrestamo): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/prestamos`,
      datos,
      { headers: this.obtenerHeaders() },
    );
  }
}