import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="logo-container">
        <img src="assets/logo-pamplona.png" alt="Logo Pamplona" class="logo">
        <span class="title">Mapa de Gestión de Territorio · Referencia de zonas altas ante inundaciones </span>
      </div>
      <nav class="nav-buttons">
        <button class="btn btn-outline" (click)="toggleElevaciones.emit()">
          {{ mostrarElevaciones ? 'Ocultar' : 'Mostrar' }} Elevaciones
        </button>
        <button class="btn btn-outline" (click)="toggleContornos.emit()">
          {{ mostrarContornos ? 'Ocultar' : 'Mostrar' }} Contornos
        </button>
        <button class="btn btn-outline" (click)="toggleElevacionPuntual.emit()">
          {{ mostrarElevacionPuntual ? 'Desactivar' : 'Activar' }} Elevación Puntual
        </button>
        <button class="btn btn-outline" (click)="onGuardarVista()">
          Guardar Vista
        </button>
        <button class="btn btn-outline">Exportar</button>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background-color: #1a73e8;
      color: white;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      height: 40px;
      width: auto;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .nav-buttons {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.2s ease;
      /* color: white; */
      border: 1px solid rgba(255,255,255,0.5);
    }

    .btn:hover {
      background-color: rgba(255,255,255,0.5);
    }
  `]
})
export class HeaderComponent {
  @Input() mostrarElevaciones: boolean = false;
  @Input() mostrarContornos: boolean = false;
  @Input() mostrarElevacionPuntual: boolean = false;
  @Output() toggleElevaciones = new EventEmitter<void>();
  @Output() toggleContornos = new EventEmitter<void>();
  @Output() toggleElevacionPuntual = new EventEmitter<void>();
  @Output() guardarVista = new EventEmitter<void>();

  onGuardarVista() {
    this.guardarVista.emit();
  }
} 