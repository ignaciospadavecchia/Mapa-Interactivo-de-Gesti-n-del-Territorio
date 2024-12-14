import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vista } from '../models/vista.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VistaService {
  private apiUrl = `${environment.apiUrl}/vistas`;

  constructor(private http: HttpClient) { }

  obtenerVistas(): Observable<Vista[]> {
    return this.http.get<Vista[]>(this.apiUrl);
  }

  guardarVista(vista: Vista): Observable<Vista> {
    return this.http.post<Vista>(this.apiUrl, vista);
  }
} 