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

      // AQUÍ ESTÁ LA CONEXIÓN AL SERVICIO
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log("¡Éxito! Respuesta del servidor:", response);
          // Aquí puedes redirigir al usuario o guardar el token
        },
        error: (error) => {
          console.error("¡Error al conectar con el backend!", error);
        }
      });

    } else {
      console.log("Formulario inválido");
    }
  }


}
