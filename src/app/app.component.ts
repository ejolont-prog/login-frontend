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
          console.log("¡Éxito! Respuesta del servidor:", response);

          // EXTRAEMOS EL TOKEN (Ajusta 'token' si tu Java lo devuelve con otro nombre)
          const token = response.token || response;

          // LA ALERTA MÁGICA
          alert("¡Conexión Exitosa! Este es tu token:\n\n" + JSON.stringify(token));
        },
        error: (error) => {
          console.error("¡Error al conectar con el backend!", error);
          alert("Error al conectar: " + error.message);
        }
      });

    } else {
      console.log("Formulario inválido");
    }
  }


}
