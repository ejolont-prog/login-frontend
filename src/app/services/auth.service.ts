import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Definimos la llave para el almacenamiento local
  private readonly TOKEN_KEY = 'session_token';

  // URL de tu API en Heroku
  private apiUrl = `${API_BASE_URL}/login`;

  constructor(private http: HttpClient) { }

  // Método para enviar las credenciales al backend
  login(credentials: any): Observable<any> {
    console.log("Enviando petición a:", this.apiUrl, "con datos:", credentials);
    return this.http.post(this.apiUrl, credentials);
  }

  // --- MÉTODOS PARA GESTIONAR EL TOKEN Y LA SESIÓN ---

  // Guarda el token en el almacenamiento del navegador
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Recupera el token guardado
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  // En el AuthService de la app de LOGIN
  logoutLocal(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Verifica si hay una sesión activa y si el token es válido (no ha expirado)
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Los JWT tienen el formato: header.payload.signature
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // Validamos el tiempo de expiración (exp está en segundos, Date.now en ms)
      const expiryTime = decodedPayload.exp * 1000;
      return Date.now() < expiryTime;
    } catch (error) {
      console.error('Error al validar el token:', error);
      return false;
    }
  }

  // Extrae la información del usuario (como el rol) directamente del token
  getUserData(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Elimina el token para cerrar la sesión
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
