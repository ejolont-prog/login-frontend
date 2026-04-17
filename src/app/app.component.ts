import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { REDIRECT_URLS } from '../app/api.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'login';
  loginForm: FormGroup;
  private estaCerrandoSesion = false; // Flag para bloquear redirecciones automáticas

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    // --- 1. BLOQUE DE SEGURIDAD SÍNCRONO ---
    // Detectamos el logout antes de que Angular inicie su ciclo de vida
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      this.estaCerrandoSesion = true;
      console.log("CONSTRUCTOR: Detectado logout. Borrando token y bloqueando redirección.");

      // Borramos el token directamente para asegurar que no exista al llegar al ngOnInit
      localStorage.removeItem('session_token');

      // Limpiamos la URL para estética y para evitar procesar el logout dos veces
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rol: ['pesocabal', Validators.required]
    });
  }

  ngOnInit(): void {
    // --- 2. MANEJO DE PARÁMETROS DE RUTA ---
    this.route.queryParams.subscribe(params => {
      const tieneParametroLogout = params['logout'] === 'true';

      if (tieneParametroLogout || this.estaCerrandoSesion) {
        console.log("NGONINIT: Modo logout activo. Redirección automática cancelada.");
        this.authService.logoutLocal(); // Asegura limpieza en el servicio
        return; // SE DETIENE AQUÍ: No permite que verificarYRedirigir se ejecute
      }

      // 3. SOLO si no hay rastro de logout, intentamos la validación
      this.verificarYRedirigir();
    });
  }

  private verificarYRedirigir(): void {
    if (this.authService.isLoggedIn()) {
      const userData = this.authService.getUserData();
      const rol = (userData?.rol || userData?.role)?.toLowerCase().trim();

      if (rol) {
        console.log("Sesión activa detectada para:", rol);

        // Usamos .replace() para que el Login no quede en el historial
        if (rol === 'agricultor') {
          window.location.replace(REDIRECT_URLS.agricultor);
        } else if (rol === 'pesocabal') {
          window.location.replace(REDIRECT_URLS.pesocabal);
        } else if (rol === 'beneficio') {
          window.location.replace(REDIRECT_URLS.beneficio);
        }
      }
    } else {
      console.log("No hay sesión previa. Esperando credenciales.");
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const token = response.token;
          const rol = (response.rol || response.role).toLowerCase().trim();

          // Guardamos el token en el LocalStorage del puerto 4200 (Login)
          this.authService.setToken(token);

          // Redirección inicial pasando el token por URL a la app destino
          if (rol === 'agricultor') {
            window.location.href = `${REDIRECT_URLS.agricultor}/?token=${token}`;
          }
          else if (rol === 'pesocabal') {
            window.location.href = `${REDIRECT_URLS.pesocabal}/?token=${token}`;
          }
          else if (rol === 'beneficio') {
            window.location.href = `${REDIRECT_URLS.beneficio}/?token=${token}`;
          }
          else {
            alert("Rol no reconocido: " + rol);
          }
        },
        error: (error) => {
          console.error("Error de autenticación", error);
          alert("Error: Verifique sus credenciales.");
        }
      });
    } else {
      alert("Por favor, rellene todos los campos.");
    }
  }
}
