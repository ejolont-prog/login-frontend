import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// 1. IMPORTANTE: Agregar Validators a la importación
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../app/services/auth.service';


// 2. IMPORTANTE: Agregar MatSelectModule
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule // 3. IMPORTANTE: Agregar al array de imports
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'login';
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rol: ['pesocabal', Validators.required]
    });
  }
  onLogin() {
    if (this.loginForm.valid) {
      console.log("Enviando al backend:", this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // 'response' es el objeto AuthResponse de Java: { token: '...', rol: '...' }
          console.log("¡Éxito! Respuesta del servidor:", response);

          const token = response.token;
          // Limpiamos el rol (minúsculas y sin espacios) por seguridad
          const rol = response.rol.toLowerCase().trim();

          // --- LÓGICA DE REDIRECCIÓN A NETLIFY ---

          if (rol === 'agricultor') {
            // Una sola barra antes del #
            window.location.href = `https://agricultor.netlify.app/#token=${token}`;
          }
          else if (rol === 'pesocabal') {
            window.location.href = `https://pesocabal.netlify.app/#token=${token}`;
          }
          else if (rol === 'beneficio') {
            // Asegúrate de que el nombre del subdominio sea el exacto de Netlify
            window.location.href = `https://beneficiofront.netlify.app/#token=${token}`;
          }
          else {
            alert("Rol no reconocido: " + rol);
          }
        },
        error: (error) => {
          console.error("¡Error al conectar con el backend!", error);
          alert("Error de autenticación: Verifique sus credenciales.");
        }
      });

    } else {
      console.log("Formulario inválido");
      alert("Por favor, rellene todos los campos.");
    }
  }


}
