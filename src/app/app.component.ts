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
import Swal from 'sweetalert2'; // <--- Importar SweetAlert

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

      Swal.fire({
        title: 'Validando credenciales',
        text: 'Conectando con el sistema...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          Swal.close();
          const token = response.token;
          const rol = (response.rol || response.role).toLowerCase().trim();
          this.authService.setToken(token);

          // Alerta de éxito antes de redirigir
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Sesión iniciada correctamente',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            const targetUrls: any = {
              'agricultor': `${REDIRECT_URLS.agricultor}/?token=${token}`,
              'pesocabal': `${REDIRECT_URLS.pesocabal}/?token=${token}`,
              'beneficio': `${REDIRECT_URLS.beneficio}/?token=${token}`
            };
            window.location.href = targetUrls[rol];
          });
        },
        error: (error) => {
          Swal.close();

          // Lógica de errores específicos según el status del HTTP
          let mensajeError = 'Hubo un problema al conectar con el servidor.';
          let tituloError = 'Error de conexión';

          if (error.status === 401) {
            tituloError = 'Contraseña Incorrecta';
            mensajeError = 'La contraseña ingresada no es la correcta.';
          } else if (error.status === 404) {
            tituloError = 'Usuario no encontrado';
            mensajeError = 'El nombre de usuario no existe en el sistema.';
          } else if (error.status === 403) {
            tituloError = 'Acceso denegado';
            mensajeError = 'Tu usuario no tiene permisos para entrar a este rol.';
          }

          Swal.fire({
            icon: 'error',
            title: tituloError,
            text: mensajeError,
            confirmButtonColor: '#2c3e50',
            confirmButtonText: 'Reintentar'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debes completar todos los campos del formulario.',
        confirmButtonColor: '#2c3e50'
      });
    }
  }
}
