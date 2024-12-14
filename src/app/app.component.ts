import { Component } from '@angular/core';
import { MapaComponent } from './components/mapa/mapa.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapaComponent, HeaderComponent, CommonModule],
  template: `
    <app-header 
      [mostrarElevaciones]="mapaComponent.mostrarElevaciones"
      [mostrarContornos]="mapaComponent.mostrarContornos"
      [mostrarElevacionPuntual]="mapaComponent.mostrarElevacionPuntual"
      (toggleElevaciones)="mapaComponent.toggleElevaciones()"
      (toggleContornos)="mapaComponent.toggleContornos()"
      (toggleElevacionPuntual)="mapaComponent.toggleElevacionPuntual()"
      (guardarVista)="mapaComponent.guardarVista()">
    </app-header>
    <app-mapa #mapaComponent></app-mapa>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'territorio-pamplona';
}
