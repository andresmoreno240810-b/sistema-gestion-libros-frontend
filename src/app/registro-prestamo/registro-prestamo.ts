import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CrearPrestamo,
  Lector,
  LibroDisponible,
  PrestamoService,
} from '../services/prestamo.service';

interface LibroSeleccionadoFormulario {
  libro_id: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-registro-prestamo',
  imports: [FormsModule],
  templateUrl: './registro-prestamo.html',
  styleUrl: './registro-prestamo.css',
})
export class RegistroPrestamo implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  lectores: Lector[] = [];
  librosDisponibles: LibroDisponible[] = [];

  usuarioId: number | null = null;

  fechaPrestamo = this.formatearFecha(new Date());
  fechaDevolucion = this.obtenerFechaDevolucion();

  librosSeleccionados: LibroSeleccionadoFormulario[] = [
    { libro_id: null, cantidad: 1 },
  ];

  cargandoOpciones = false;
  guardando = false;
  errorMessage = '';
  successMessage = '';

  constructor(private prestamoService: PrestamoService) {}

  ngOnInit(): void {
    // La consulta requiere el token guardado en el navegador.
    if (isPlatformBrowser(this.platformId)) {
      this.cargarOpciones();
    }
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private obtenerFechaDevolucion(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 14);
    return this.formatearFecha(fecha);
  }

  cargarOpciones(): void {
    this.cargandoOpciones = true;
    this.errorMessage = '';

    this.prestamoService.obtenerOpciones().subscribe({
      next: (respuesta) => {
        this.lectores = respuesta.lectores;
        this.librosDisponibles = respuesta.libros;
        this.cargandoOpciones = false;
      },
      error: (error) => {
        this.cargandoOpciones = false;

        if (error.status === 401) {
          this.errorMessage =
            'Tu sesión no es válida. Vuelve a iniciar sesión.';
        } else if (error.status === 0) {
          this.errorMessage =
            'No se pudo conectar con Laravel. Comprueba que el backend esté funcionando.';
        } else {
          this.errorMessage =
            error.error?.message || 'No se pudieron cargar los lectores y libros.';
        }
      },
    });
  }

  agregarLibro(): void {
    this.errorMessage = '';

    if (this.librosSeleccionados.length >= this.librosDisponibles.length) {
      this.errorMessage = 'No hay más libros disponibles para agregar.';
      return;
    }

    this.librosSeleccionados.push({
      libro_id: null,
      cantidad: 1,
    });
  }

  quitarLibro(indice: number): void {
    if (this.librosSeleccionados.length === 1) {
      this.errorMessage = 'Debes dejar al menos un libro en el préstamo.';
      return;
    }

    this.librosSeleccionados.splice(indice, 1);
    this.errorMessage = '';
  }

  librosParaSeleccion(indiceActual: number): LibroDisponible[] {
    const otrosIds = new Set(
      this.librosSeleccionados
        .filter((item, indice) => indice !== indiceActual)
        .map((item) => item.libro_id)
        .filter((id): id is number => id !== null),
    );

    const idActual = this.librosSeleccionados[indiceActual].libro_id;

    return this.librosDisponibles.filter(
      (libro) => !otrosIds.has(libro.id) || libro.id === idActual,
    );
  }

  obtenerLibro(id: number | null): LibroDisponible | undefined {
    if (id === null) {
      return undefined;
    }

    return this.librosDisponibles.find((libro) => libro.id === id);
  }

  obtenerDisponibles(id: number | null): number {
    return this.obtenerLibro(id)?.disponibles ?? 1;
  }

  alCambiarLibro(indice: number): void {
    const seleccionado = this.librosSeleccionados[indice];
    const libro = this.obtenerLibro(seleccionado.libro_id);

    if (libro && seleccionado.cantidad > libro.disponibles) {
      seleccionado.cantidad = libro.disponibles;
    }

    this.errorMessage = '';
  }

  nombreLectorSeleccionado(): string {
    const lector = this.lectores.find(
      (item) => item.id === this.usuarioId,
    );

    return lector?.name ?? 'No seleccionado';
  }

  totalEjemplares(): number {
    return this.librosSeleccionados.reduce(
      (total, item) => total + (Number(item.cantidad) || 0),
      0,
    );
  }

  registrarPrestamo(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.cargandoOpciones || this.guardando) {
      return;
    }

    if (this.usuarioId === null) {
      this.errorMessage = 'Selecciona un lector.';
      return;
    }

    if (
      !this.fechaPrestamo ||
      !this.fechaDevolucion ||
      this.fechaDevolucion < this.fechaPrestamo
    ) {
      this.errorMessage =
        'La fecha de devolución debe ser igual o posterior a la fecha del préstamo.';
      return;
    }

    if (
      this.librosSeleccionados.some((item) => item.libro_id === null)
    ) {
      this.errorMessage = 'Selecciona un libro en cada fila.';
      return;
    }

    const ids = this.librosSeleccionados.map(
      (item) => item.libro_id as number,
    );

    if (new Set(ids).size !== ids.length) {
      this.errorMessage =
        'No puedes seleccionar el mismo libro más de una vez. Ajusta su cantidad en una sola fila.';
      return;
    }

    for (const item of this.librosSeleccionados) {
      const libro = this.obtenerLibro(item.libro_id);
      const cantidad = Number(item.cantidad);

      if (
        !libro ||
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > libro.disponibles
      ) {
        this.errorMessage =
          `Revisa la cantidad de ejemplares de ${libro?.titulo ?? 'uno de los libros'}.`;
        return;
      }
    }

    const datos: CrearPrestamo = {
      user_id: this.usuarioId,
      fecha_prestamo: this.fechaPrestamo,
      fecha_devolucion: this.fechaDevolucion,
      libros: this.librosSeleccionados.map((item) => ({
        libro_id: item.libro_id as number,
        cantidad: Number(item.cantidad),
      })),
    };

    this.guardando = true;

    this.prestamoService.crearPrestamo(datos).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.successMessage =
          respuesta.message || 'Préstamo registrado correctamente.';

        this.usuarioId = null;
        this.fechaPrestamo = this.formatearFecha(new Date());
        this.fechaDevolucion = this.obtenerFechaDevolucion();
        this.librosSeleccionados = [{ libro_id: null, cantidad: 1 }];

        // Actualizar las existencias que aparecen en el formulario.
        this.cargarOpciones();
      },
      error: (error) => {
        this.guardando = false;

        if (error.status === 401) {
          this.errorMessage =
            'Tu sesión no es válida. Vuelve a iniciar sesión.';
          return;
        }

        if (error.status === 0) {
          this.errorMessage =
            'No se pudo conectar con Laravel. Comprueba que el backend esté funcionando.';
          return;
        }

        const errores = error.error?.errors as
          | Record<string, unknown[]>
          | undefined;

        const primerError = errores
          ? Object.values(errores).flat()[0]
          : undefined;

        this.errorMessage =
          (typeof primerError === 'string' ? primerError : null) ||
          error.error?.message ||
          'No se pudo registrar el préstamo.';
      },
    });
  }
}
