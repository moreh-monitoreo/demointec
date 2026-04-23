
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../services/errror.services';
import { LoginAdapterService } from '../../adapters/login.adapter';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
 
  constructor(
    private fb: FormBuilder, 
    private loginService: LoginAdapterService, 
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Por favor completa los campos correctamente.');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.loginService.login(email, password).subscribe({
      next: (response) => {
        this.toastr.success(response.msg);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(['/dashboard']); 
      },
      error: (error) => {
        this.errorService.handleError(error, 'Error al iniciar sesión');
      }
    });
  }
}
