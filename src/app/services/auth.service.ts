import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 1. Importa el cliente HTTP
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 2. Define la URL de tu API


  // BUSCA ESTA LÍNEA
// private apiUrl = 'http://localhost:8084/api/auth/login';

// Y CÁMBIALA POR ESTA (La de tu Heroku):
  private apiUrl = 'https://login-backends-1b6c2f35caf3.herokuapp.com/api/auth/login';

  // 3. Inyecta el HttpClient en el constructor
  constructor(private http: HttpClient) { }

  // 4. Crea el método para enviar los datos
  login(credentials: any): Observable<any> {
    console.log("Enviando petición a:", this.apiUrl, "con datos:", credentials);
    return this.http.post(this.apiUrl, credentials);
  }
}
