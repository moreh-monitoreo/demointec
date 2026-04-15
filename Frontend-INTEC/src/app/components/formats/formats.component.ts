import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportRenunciaLaboralService } from '../../services/reports/report_renuncia_laboral.service';
import { ReportEntrevistaSalidaService } from '../../services/reports/report_entrevista_salida.service';
import { ReportEncuestaSatisfaccionService } from '../../services/reports/report_encuesta_satisfaccion.service';
import { ReportAvisoPrivacidadService } from '../../services/reports/report_aviso_privacidad.service';
import { ReportCaratulaIngresoService } from '../../services/reports/report_caratula_ingreso.service';
import { ReportConstanciaTrabajoOperacionesService } from '../../services/reports/report_constancia_trabajo_operaciones.service';
import { ReportCartaPatronalService } from '../../services/reports/report_carta_patronal.service';
import { ReportContratoConfidencialidadService } from '../../services/reports/report_contrato_confidencialidad.service';
import { ReportContratoObraDeterminadaService } from '../../services/reports/report_contrato_obra_determinada.service';
import { ReportContratoTiempoDeterminadoService } from '../../services/reports/report_contrato_tiempo_determinado.service';
import { ReportPoliticaPrestamosService } from '../../services/reports/report_politica_prestamos.service';
import { ReportPoliticaBonoPermanenciaService } from '../../services/reports/report_politica_bono_permanencia.service';
import { ReportResponsivaEppService } from '../../services/reports/report_responsiva_epp.service';
import { ReportResponsivaLlavesService } from '../../services/reports/report_responsiva_llaves.service';
import { ReportRitService } from '../../services/reports/report_rit.service';
import { ReportActaAbandonoTrabajoService } from '../../services/reports/report_acta_abandono_trabajo.service';
import { ReportAnexoRitService } from '../../services/reports/report_anexo_rit.service';
import { ReportContratoTiempoIndeterminadoService } from '../../services/reports/report_contrato_tiempo_indeterminado.service';
import { ReportCartaResponsivaLeySillaService } from '../../services/reports/report_carta_responsiva_ley_silla.service';
import { ReportCartaTerminacionContratoService } from '../../services/reports/report_carta_terminacion_contrato.service';
import { ReportSolicitudPrestamoService } from '../../services/reports/report_solicitud_prestamo.service';
import { ReportSolicitudBonoPermanenciaService } from '../../services/reports/report_solicitud_bono_permanencia.service';
import { ReportSolicitudBonoRecomendacionService } from '../../services/reports/report_solicitud_bono_recomendacion.service';
import { ReportCuestionarioMedicoService } from '../../services/reports/report_cuestionario_medico.service';
import { ReportEvaluacionDesempenoService } from '../../services/reports/report_evaluacion_desempeno.service';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { Employee } from '../../models/employees';
import { LoanRequestAdapterService } from '../../adapters/loan_request.adapter';
import { LoanPaymentAdapterService } from '../../adapters/loan_payment.adapter';
import { BondApplicationAdapterService } from '../../adapters/bond_application.adapter';
import { BondRecommendationAdapterService } from '../../adapters/bond_recommendation.adapter';
import { LoanRequest } from '../../models/loan_request';
import { LoanPayment } from '../../models/loan_payment';
import { BondApplication } from '../../models/bond_application';
import { BondRecommendation } from '../../models/bond_recommendation';
import { firstValueFrom } from 'rxjs';

interface FormatItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  filePath: string;
  fileName: string;
  fillable: boolean;
}

@Component({
  selector: 'app-formats',
  templateUrl: './formats.component.html',
  styleUrl: './formats.component.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormatsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private renunciaService = inject(ReportRenunciaLaboralService);
  private entrevistaService = inject(ReportEntrevistaSalidaService);
  private encuestaService = inject(ReportEncuestaSatisfaccionService);
  private avisoService = inject(ReportAvisoPrivacidadService);
  private caratulaService = inject(ReportCaratulaIngresoService);
  private constanciaTrabajoOperacionesService = inject(ReportConstanciaTrabajoOperacionesService);
  private cartaPatronalService = inject(ReportCartaPatronalService);
  private contratoConfService = inject(ReportContratoConfidencialidadService);
  private contratoObraService = inject(ReportContratoObraDeterminadaService);
  private contratoTiempoService = inject(ReportContratoTiempoDeterminadoService);
  private politicaPrestamosService = inject(ReportPoliticaPrestamosService);
  private politicaBonoPermanenciaService = inject(ReportPoliticaBonoPermanenciaService);
  private responsivaEppService = inject(ReportResponsivaEppService);
  private responsivaLlavesService = inject(ReportResponsivaLlavesService);
  private ritService = inject(ReportRitService);
  private actaAbandonoService = inject(ReportActaAbandonoTrabajoService);
  private anexoRitService = inject(ReportAnexoRitService);
  private contratoIndeterminadoService = inject(ReportContratoTiempoIndeterminadoService);
  private cartaResponsivaLeySillaService = inject(ReportCartaResponsivaLeySillaService);
  private cartaTerminacionContratoService = inject(ReportCartaTerminacionContratoService);
  private solicitudPrestamoService = inject(ReportSolicitudPrestamoService);
  private solicitudBonoPermanenciaService = inject(ReportSolicitudBonoPermanenciaService);
  private solicitudBonoRecomendacionService = inject(ReportSolicitudBonoRecomendacionService);
  private employeesAdapter = inject(EmployeesAdapterService);
  private loanRequestAdapter = inject(LoanRequestAdapterService);
  private loanPaymentAdapter = inject(LoanPaymentAdapterService);
  private bondApplicationAdapter = inject(BondApplicationAdapterService);
  private bondRecommendationAdapter = inject(BondRecommendationAdapterService);
  private cuestionarioMedicoService = inject(ReportCuestionarioMedicoService);
  private evaluacionDesempenoService = inject(ReportEvaluacionDesempenoService);

  // ── Autocomplete ────────────────────────────────────────────────────────────
  employees: Employee[] = [];
  employeeSearch: string = '';
  employeeSuggestions: Employee[] = [];
  showSuggestions: boolean = false;
  selectedLoanEmployeeId: string = '';
  selectedBondEmployeeId: string = '';
  selectedBondRecEmployeeId: string = '';

  ngOnInit(): void {
    this.employeesAdapter.getList().subscribe({
      next: (list) => { this.employees = list; },
      error: () => { this.employees = []; }
    });
  }

  onFechaInicioPagoChange(value: string): void {
    if (!value) return;
    const [yyyy, mm, dd] = value.split('-');
    this.solicitudPrestamoForm.patchValue({ fechaInicioPago: `${dd}/${mm}/${yyyy}` });
  }

  private isoToDisplay(date?: string): string {
    if (!date) return '';
    const [yyyy, mm, dd] = date.split('-');
    if (!dd) return date;
    return `${dd}/${mm}/${yyyy}`;
  }

  displayToIso(date?: string): string {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  onDateChange(form: string, field: string, value: string): void {
    if (!value) return;
    const [yyyy, mm, dd] = value.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    if (form === 'entrevista') this.entrevistaForm.patchValue({ [field]: formatted });
    else if (form === 'caratula') this.caratulaForm.patchValue({ [field]: formatted });
    else if (form === 'solicitud-prestamo') this.solicitudPrestamoForm.patchValue({ [field]: formatted });
    else if (form === 'encuesta') this.encuestaForm.patchValue({ [field]: formatted });
    else if (form === 'solicitud-bono-permanencia') this.solicitudBonoPermanenciaForm.patchValue({ [field]: formatted });
    else if (form === 'solicitud-bono-recomendacion') this.solicitudBonoRecomendacionForm.patchValue({ [field]: formatted });
    else if (form === 'evaluacion-desempeno') this.evaluacionDesempenoForm.patchValue({ [field]: formatted });
  }

  onSearchInput(value: string): void {
    this.employeeSearch = value;
    const q = value.trim().toLowerCase();
    if (q.length < 2) {
      this.employeeSuggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.employeeSuggestions = this.employees
      .filter(e => e.name_employee?.toLowerCase().includes(q))
      .slice(0, 8);
    this.showSuggestions = this.employeeSuggestions.length > 0;
  }

  selectEmployee(emp: Employee): void {
    this.employeeSearch = emp.name_employee;
    this.showSuggestions = false;
    this.patchFormWithEmployee(emp);
  }

  clearSearch(): void {
    this.employeeSearch = '';
    this.employeeSuggestions = [];
    this.showSuggestions = false;
  }

  // Parsea birth_date "YYYY-MM-DD" y devuelve {day, month, year}
  private parseBirthDate(bd: string | undefined): { day: string; month: string; year: string } {
    if (!bd) return { day: '', month: '', year: '' };
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const parts = bd.split('-');
    const day = parts[2] ? String(parseInt(parts[2], 10)) : '';
    const month = parts[1] ? (meses[parseInt(parts[1], 10) - 1] ?? '') : '';
    const year = parts[0] ?? '';
    return { day, month, year };
  }

  private patchFormWithEmployee(emp: Employee): void {
    const bd = this.parseBirthDate(emp.birth_date);

    if (this.activeFormatKey === 'entrevista-salida') {
      this.entrevistaForm.patchValue({
        nombreColaborador: emp.name_employee ?? '',
        puesto: emp.position ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
        telefono: emp.phone ?? '',
      });

    } else if (this.activeFormatKey === 'renuncia-laboral') {
      this.renunciaForm.patchValue({
        nombreTrabajador: emp.name_employee ?? '',
        puesto: emp.position ?? '',
      });

    } else if (this.activeFormatKey === 'encuesta-satisfaccion') {
      this.encuestaForm.patchValue({
        nombre: emp.name_employee ?? '',
        puesto: emp.position ?? '',
        edad: emp.age ? String(emp.age) : '',
        estadoCivil: emp.marital_status ?? '',
        domicilio: emp.address ?? emp.street ?? '',
        ingreso: this.isoToDisplay(emp.admission_date),
      });

    } else if (this.activeFormatKey === 'aviso-privacidad') {
      this.avisoForm.patchValue({
        nombre: emp.name_employee ?? '',
      });

    } else if (this.activeFormatKey === 'caratula-ingreso') {
      this.caratulaForm.patchValue({
        nombreCompleto: emp.name_employee ?? '',
        sexo: emp.gender ?? '',
        curp: emp.curp ?? '',
        rfc: emp.rfc ?? '',
        imss: emp.nss ?? '',
        escolaridad: emp.education_level ?? '',
        correo: emp.email ?? '',
        fechaNac: this.isoToDisplay(emp.birth_date),
        lugarNac: emp.birth_place ?? '',
        estadoCivil: emp.marital_status ?? '',
        dependientes: emp.children_count ? String(emp.children_count) : '',
        domicilio: emp.street ?? '',
        colonia: emp.colony ?? '',
        codigoPostal: emp.zip_code ?? '',
        ciudad: emp.city ?? '',
        estado: emp.state ?? '',
        tipoSanguineo: emp.blood_type ?? '',
        alergias: emp.allergies ?? '',
        contactoEmergencias: emp.emergency_contact_name ?? '',
        numeroEmergencias: emp.emergency_phone ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
        puesto: emp.position ?? '',
        sd: emp.base_salary ? String(emp.base_salary) : '',
        beneficiario1: emp.beneficiary ?? '',
        parentesco1: emp.beneficiary_relationship ?? '',
        porcentaje1: emp.beneficiary_percentage ?? '',
        beneficiario2: emp.beneficiary2_name ?? '',
        parentesco2: emp.beneficiary2_relationship ?? '',
        porcentaje2: emp.beneficiary2_percentage ?? '',
      });

    } else if (this.activeFormatKey === 'carta-patronal') {
      this.cartaPatronalForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        puesto: emp.position ?? '',
        horarioInicio: emp.entry_time ?? '',
        horarioFin: emp.exit_time ?? '',
        nss: emp.nss ?? '',
      });
    } else if (this.activeFormatKey === 'constancia-trabajo-operaciones') {
      this.constanciaTrabajoOperacionesForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        puesto: emp.position ?? '',
      });

    } else if (this.activeFormatKey === 'contrato-confidencialidad') {
      this.contratoConfForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        rfc: emp.rfc ?? '',
        curp: emp.curp ?? '',
        calle: emp.street ?? '',
        numero: emp.outdoor_number ?? '',
        ext: emp.interior_number ?? '',
        colonia: emp.colony ?? '',
        municipio: emp.city ?? '',
        estado: emp.state ?? '',
        cp: emp.zip_code ?? '',
        puesto: emp.position ?? '',
      });

    } else if (this.activeFormatKey === 'contrato-tiempo-determinado') {
      this.contratoTiempoForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        sexo: emp.gender ?? '',
        edad: emp.age ? String(emp.age) : '',
        claveElector: emp.ine_code ?? '',
        calle: emp.street ?? '',
        numero: emp.outdoor_number ?? '',
        ext: emp.interior_number ?? '',
        colonia: emp.colony ?? '',
        cp: emp.zip_code ?? '',
        lugarNacimiento: emp.birth_place ?? '',
        diaNacimiento: bd.day,
        mesNacimiento: bd.month,
        anioNacimiento: bd.year,
        nss: emp.nss ?? '',
        rfc: emp.rfc ?? '',
        curp: emp.curp ?? '',
        puesto: emp.position ?? '',
        horaInicioLV: emp.entry_time ?? '',
        horaFinLV: emp.exit_time ?? '',
        benNombre1: emp.beneficiary ?? '',
        benParentesco1: emp.beneficiary_relationship ?? '',
        benPorcentaje1: emp.beneficiary_percentage ?? '',
        benNombre2: emp.beneficiary2_name ?? '',
        benParentesco2: emp.beneficiary2_relationship ?? '',
        benPorcentaje2: emp.beneficiary2_percentage ?? '',
        benNombre3: emp.beneficiary3_name ?? '',
        benParentesco3: emp.beneficiary3_relationship ?? '',
        benPorcentaje3: emp.beneficiary3_percentage ?? '',
      });

    } else if (this.activeFormatKey === 'solicitud-prestamo') {
      this.selectedLoanEmployeeId = emp.id_employee ?? '';
      this.solicitudPrestamoForm.patchValue({
        nombre: emp.name_employee ?? '',
        puesto: emp.position ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
      });

    } else if (this.activeFormatKey === 'solicitud-bono-permanencia') {
      this.selectedBondEmployeeId = emp.id_employee ?? '';
      this.solicitudBonoPermanenciaForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
        fechaContratacion: this.isoToDisplay(emp.admission_date),
      });

    } else if (this.activeFormatKey === 'solicitud-bono-recomendacion') {
      this.selectedBondRecEmployeeId = emp.id_employee ?? '';
      this.solicitudBonoRecomendacionForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
        fechaContratacion: this.isoToDisplay(emp.admission_date),
      });

    } else if (this.activeFormatKey === 'carta-terminacion-contrato') {
      this.cartaTerminacionContratoForm.patchValue({
        nombreTrabajador: emp.name_employee ?? '',
        puesto: emp.position ?? '',
      });

    } else if (this.activeFormatKey === 'cuestionario-medico') {
      const g = (emp.gender ?? '').toUpperCase();
      const sexoNorm = g.startsWith('M') ? 'M' : g.startsWith('F') ? 'F' : '';
      this.cuestionarioMedicoForm.patchValue({
        nombre: emp.name_employee ?? '',
        edad: emp.age ? String(emp.age) : '',
        puesto: emp.position ?? '',
        sexo: sexoNorm,
        edoCivil: emp.marital_status ?? '',
        imss: emp.nss ?? '',
        telefono: emp.phone ?? '',
        tipoSangre: emp.blood_type ?? '',
      });

    } else if (this.activeFormatKey === 'contrato-tiempo-indeterminado') {
      this.contratoIndeterminadoForm.patchValue({
        nombreTrabajador: emp.name_employee ?? '',
        nacionalidad: 'Mexicana',
        calle: emp.street ?? '',
        numero: emp.outdoor_number ?? '',
        colonia: emp.colony ?? '',
        cp: emp.zip_code ?? '',
        edad: emp.age ? String(emp.age) : '',
        sexo: emp.gender ?? '',
        estadoCivil: emp.marital_status ?? '',
        curp: emp.curp ?? '',
        rfc: emp.rfc ?? '',
        nss: emp.nss ?? '',
        puesto: emp.position ?? '',
      });

    } else if (this.activeFormatKey === 'evaluacion-desempeno') {
      this.evaluacionDesempenoForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        puestoEmpleado: emp.position ?? '',
        fechaIngreso: this.isoToDisplay(emp.admission_date),
      });

    } else if (this.activeFormatKey === 'contrato-obra-determinada') {
      this.contratoObraForm.patchValue({
        nombreEmpleado: emp.name_employee ?? '',
        sexo: emp.gender ?? '',
        edad: emp.age ? String(emp.age) : '',
        claveElector: emp.ine_code ?? '',
        calle: emp.street ?? '',
        numero: emp.outdoor_number ?? '',
        ext: emp.interior_number ?? '',
        colonia: emp.colony ?? '',
        cp: emp.zip_code ?? '',
        lugarNacimiento: emp.birth_place ?? '',
        diaNacimiento: bd.day,
        mesNacimiento: bd.month,
        anioNacimiento: bd.year,
        nss: emp.nss ?? '',
        rfc: emp.rfc ?? '',
        curp: emp.curp ?? '',
        puesto: emp.position ?? '',
        horaInicioLV: emp.entry_time ?? '',
        horaFinLV: emp.exit_time ?? '',
        benNombre1: emp.beneficiary ?? '',
        benParentesco1: emp.beneficiary_relationship ?? '',
        benPorcentaje1: emp.beneficiary_percentage ?? '',
        benNombre2: emp.beneficiary2_name ?? '',
        benParentesco2: emp.beneficiary2_relationship ?? '',
        benPorcentaje2: emp.beneficiary2_percentage ?? '',
        benNombre3: emp.beneficiary3_name ?? '',
        benParentesco3: emp.beneficiary3_relationship ?? '',
        benPorcentaje3: emp.beneficiary3_percentage ?? '',
      });
    }
  }

  // ── Estado del modal ────────────────────────────────────────────────────────
  showModal: boolean = false;
  activeFormatKey: string = '';
  isGenerating: boolean = false;

  entrevistaForm: FormGroup = this.fb.group({
    nombreColaborador: ['', Validators.required],
    puesto: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    areaDepto: ['', Validators.required],
    jefeInmediato: ['', Validators.required],
    telefono: ['', Validators.required],
    fechaSalida: ['', Validators.required],
  });

  renunciaForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreTrabajador: ['', Validators.required],
    puesto: ['', Validators.required],
    diaInicioLaboral: ['', Validators.required],
    mesInicioLaboral: ['', Validators.required],
    anioInicioLaboral: ['', Validators.required],
    diaSeparacion: ['', Validators.required],
    mesSeparacion: ['', Validators.required],
  });

  encuestaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    puesto: ['', Validators.required],
    edad: ['', Validators.required],
    estadoCivil: ['', Validators.required],
    ubicacionObra: ['', Validators.required],
    ingreso: ['', Validators.required],
    domicilio: ['', Validators.required],
  });

  avisoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
  });

  caratulaForm: FormGroup = this.fb.group({
    nombreEmpresa1: ['INTEC DE JALISCO S.A. DE C.V.', Validators.required],
    nombreCompleto: ['', Validators.required],
    sexo: ['', Validators.required],
    curp: ['', Validators.required],
    rfc: ['', Validators.required],
    imss: ['', Validators.required],
    escolaridad: ['', Validators.required],
    correo: ['', Validators.required],
    fechaNac: ['', Validators.required],
    lugarNac: ['', Validators.required],
    estadoCivil: ['', Validators.required],
    dependientes: ['', Validators.required],
    domicilio: ['', Validators.required],
    colonia: ['', Validators.required],
    codigoPostal: ['', Validators.required],
    ciudad: ['', Validators.required],
    estado: ['', Validators.required],
    tipoSanguineo: ['', Validators.required],
    alergias: [''],
    cirugias: [''],
    contactoEmergencias: ['', Validators.required],
    numeroEmergencias: ['', Validators.required],
    periodoPago: ['', Validators.required],
    bonos: [''],
    comisiones: [''],
    fechaIngreso: ['', Validators.required],
    puesto: ['', Validators.required],
    depto: ['', Validators.required],
    sd: [''],
    sdi: [''],
    sMensual: [''],
    ubicacionPago: [''],
    numeroCuentaClave: [''],
    beneficiario1: [''],
    contactoBeneficiario1: [''],
    parentesco1: [''],
    porcentaje1: [''],
    beneficiario2: [''],
    contactoBeneficiario2: [''],
    parentesco2: [''],
    porcentaje2: [''],
  });

  cartaPatronalForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreEmpleado: ['', Validators.required],
    puesto: ['', Validators.required],
    area: ['', Validators.required],
    diasLaborales: ['', Validators.required],
    horarioInicio: ['', Validators.required],
    horarioFin: ['', Validators.required],
    ingresoMensual: ['', Validators.required],
    nss: ['', Validators.required],
    diaAltaNss: ['', Validators.required],
    mesAltaNss: ['', Validators.required],
    anioAltaNss: ['', Validators.required],
    diasVacaciones: ['', Validators.required],
    nombreFirmante: ['Lic. María Asunción Mares Magallanes', Validators.required],
    cargoFirmante: ['Coordinadora de Capital Humano', Validators.required],
  });

  constanciaTrabajoOperacionesForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreEmpleado: ['', Validators.required],
    puesto: ['', Validators.required],
    diaInicio: ['', Validators.required],
    mesInicio: ['', Validators.required],
    anioInicio: ['2025', Validators.required],
    diaFin: ['', Validators.required],
    mesFin: ['', Validators.required],
    anioFin: ['2026', Validators.required],
    nombreFirmante: ['Lic. María Asunción Mares Magallanes', Validators.required],
    cargoFirmante: ['Coordinador de R.H.', Validators.required],
    celFirmante: ['3324951222', Validators.required],
  });

  contratoConfForm: FormGroup = this.fb.group({
    nombreEmpleado: ['', Validators.required],
    rfc: ['', Validators.required],
    curp: ['', Validators.required],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    ext: [''],
    colonia: ['', Validators.required],
    municipio: ['', Validators.required],
    estado: ['', Validators.required],
    cp: ['', Validators.required],
    puesto: ['', Validators.required],
  });

  contratoObraForm: FormGroup = this.fb.group({
    nombreEmpleado: ['', Validators.required],
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    sexo: ['', Validators.required],
    edad: ['', Validators.required],
    nacionalidad: ['Mexicana', Validators.required],
    claveElector: ['', Validators.required],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    ext: [''],
    colonia: ['', Validators.required],
    cp: ['', Validators.required],
    lugarNacimiento: ['', Validators.required],
    diaNacimiento: ['', Validators.required],
    mesNacimiento: ['', Validators.required],
    anioNacimiento: ['', Validators.required],
    nss: ['', Validators.required],
    rfc: ['', Validators.required],
    curp: ['', Validators.required],
    puesto: ['', Validators.required],
    horaInicioLV: ['', Validators.required],
    horaFinLV: ['', Validators.required],
    horaInicioSab: ['', Validators.required],
    horaFinSab: ['', Validators.required],
    salarioNum: ['', Validators.required],
    salarioLetras: ['', Validators.required],
    benNombre1: [''],
    benParentesco1: [''],
    benPorcentaje1: [''],
    benNombre2: [''],
    benParentesco2: [''],
    benPorcentaje2: [''],
    benNombre3: [''],
    benParentesco3: [''],
    benPorcentaje3: [''],
  });

  contratoTiempoForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreEmpleado: ['', Validators.required],
    sexo: ['', Validators.required],
    edad: ['', Validators.required],
    nacionalidad: ['Mexicana', Validators.required],
    claveElector: ['', Validators.required],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    ext: [''],
    colonia: ['', Validators.required],
    cp: ['', Validators.required],
    lugarNacimiento: ['', Validators.required],
    diaNacimiento: ['', Validators.required],
    mesNacimiento: ['', Validators.required],
    anioNacimiento: ['', Validators.required],
    nss: ['', Validators.required],
    rfc: ['', Validators.required],
    curp: ['', Validators.required],
    puesto: ['', Validators.required],
    diasPrueba: ['', Validators.required],
    diaInicioContrato: ['', Validators.required],
    mesInicioContrato: ['', Validators.required],
    anioInicioContrato: ['2026', Validators.required],
    diaFinContrato: [''],
    mesFinContrato: [''],
    anioFinContrato: [''],
    horaInicioLV: ['', Validators.required],
    horaFinLV: ['', Validators.required],
    horaInicioSab: ['', Validators.required],
    horaFinSab: ['', Validators.required],
    salarioNum: ['', Validators.required],
    salarioLetras: ['', Validators.required],
    benNombre1: [''],
    benParentesco1: [''],
    benPorcentaje1: [''],
    benNombre2: [''],
    benParentesco2: [''],
    benPorcentaje2: [''],
    benNombre3: [''],
    benParentesco3: [''],
    benPorcentaje3: [''],
  });

  politicaPrestamosForm: FormGroup = this.fb.group({
    duenioOperativo: ['', Validators.required],
    duenioEjecutivo: ['', Validators.required],
    fechaAprobacion: ['', Validators.required],
    entradaVigor: ['', Validators.required],
  });

  politicaBonoForm: FormGroup = this.fb.group({
    duenioOperativo: ['', Validators.required],
    duenioEjecutivo: ['', Validators.required],
    fechaAprobacion: ['', Validators.required],
    entradaVigor: ['', Validators.required],
  });

  responsivaEppForm: FormGroup = this.fb.group({
    fecha: ['', Validators.required],
    nombre: ['', Validators.required],
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    fila0cantidad: [''], fila0descripcion: [''], fila0talla: [''], fila0color: [''], fila0marca: [''],
    fila1cantidad: [''], fila1descripcion: [''], fila1talla: [''], fila1color: [''], fila1marca: [''],
    fila2cantidad: [''], fila2descripcion: [''], fila2talla: [''], fila2color: [''], fila2marca: [''],
    fila3cantidad: [''], fila3descripcion: [''], fila3talla: [''], fila3color: [''], fila3marca: [''],
    fila4cantidad: [''], fila4descripcion: [''], fila4talla: [''], fila4color: [''], fila4marca: [''],
  });

  responsivaLlavesForm: FormGroup = this.fb.group({
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombre: ['', Validators.required],
  });

  actaAbandonoForm: FormGroup = this.fb.group({
    ciudad: ['', Validators.required],
    estado: ['', Validators.required],
    horas: ['', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['', Validators.required],
    domicilioEmpresa: ['', Validators.required],
    nombre: ['', Validators.required],
    puesto: ['', Validators.required],
    testigo1: ['', Validators.required],
    testigo2: ['', Validators.required],
    nombreObra: ['', Validators.required],
    domicilioObra: ['', Validators.required],
  });

  anexoRitForm: FormGroup = this.fb.group({
    nombreRepresentante: ['', Validators.required],
    nombreTrabajador: ['', Validators.required],
  });

  contratoIndeterminadoForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    municipioComparecencia: ['Zapopan', Validators.required],
    estadoComparecencia: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreTrabajador: ['', Validators.required],
    nacionalidad: ['Mexicana', Validators.required],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    colonia: ['', Validators.required],
    cp: ['', Validators.required],
    edad: ['', Validators.required],
    sexo: ['', Validators.required],
    estadoCivil: ['', Validators.required],
    curp: ['', Validators.required],
    rfc: ['', Validators.required],
    nss: ['', Validators.required],
    puesto: ['', Validators.required],
    diaInicio: ['', Validators.required],
    mesInicio: ['', Validators.required],
    anioInicio: ['2026', Validators.required],
    salarioNum: ['', Validators.required],
    salarioLetras: ['', Validators.required],
    benNombre1: [''],
    benParentesco1: [''],
    benNombreSust1: [''],
    benParentescoSust1: [''],
  });

  cartaResponsivaLeySillaForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    filas: this.fb.array(this.buildLeySillaFilas(10))
  });

  cartaTerminacionContratoForm: FormGroup = this.fb.group({
    ciudad: ['Guadalajara', Validators.required],
    estado: ['Jalisco', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    nombreTrabajador: ['', Validators.required],
    puesto: ['', Validators.required],
    diaEfectivo: ['', Validators.required],
    mesEfectivo: ['', Validators.required],
    nombreFirmante: ['', Validators.required],
  });

  solicitudPrestamoForm: FormGroup = this.fb.group({
    duenioOperativo: ['', Validators.required],
    duenioEjecutivo: ['', Validators.required],
    fechaAprobacion: ['', Validators.required],
    entradaVigencia: ['', Validators.required],
    nombre: ['', Validators.required],
    puesto: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    montoSolicitado: ['', Validators.required],
    montoAutorizado: ['', Validators.required],
    motivoPrestamo: ['', Validators.required],
    formaPago: ['Semanal', Validators.required],
    numPagos: ['', Validators.required],
    fechaInicioPago: ['', Validators.required],
  });

  solicitudBonoPermanenciaForm: FormGroup = this.fb.group({
    nombreEmpleado: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    fechaContratacion: ['', Validators.required],
    bono: ['', Validators.required],
    fechaPago: ['', Validators.required],
    observaciones: [''],
  });

  solicitudBonoRecomendacionForm: FormGroup = this.fb.group({
    nombreEmpleado: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    personaRecomendada: ['', Validators.required],
    fechaContratacion: ['', Validators.required],
    bono: ['', Validators.required],
    fechaPago: ['', Validators.required],
    observaciones: [''],
  });

  cuestionarioMedicoForm: FormGroup = this.fb.group({
    nombre: [''],
    edad: [''],
    fecha: [''],
    puesto: [''],
    sexo: [''],
    edoCivil: [''],
    imss: [''],
    telefono: [''],
    tipoSangre: [''],
    // Antecedentes familiares
    afCancerSi: [false], afCancerNo: [false], afCancerPadre: [false], afCancerMadre: [false], afCancerAbuelos: [false], afCancerTios: [false], afCancerObs: [''],
    afDiabetesSi: [false], afDiabetesNo: [false], afDiabetesPadre: [false], afDiabetesMadre: [false], afDiabetesAbuelos: [false], afDiabetesTios: [false], afDiabetesObs: [''],
    afCorazonSi: [false], afCorazonNo: [false], afCorazonPadre: [false], afCorazonMadre: [false], afCorazonAbuelos: [false], afCorazonTios: [false], afCorazonObs: [''],
    afHipertensionSi: [false], afHipertensionNo: [false], afHipertensionPadre: [false], afHipertensionMadre: [false], afHipertensionAbuelos: [false], afHipertensionTios: [false], afHipertensionObs: [''],
    afConvulsionesSi: [false], afConvulsionesNo: [false], afConvulsionesPadre: [false], afConvulsionesMadre: [false], afConvulsionesAbuelos: [false], afConvulsionesTios: [false], afConvulsionesObs: [''],
    afMentalesSi: [false], afMentalesNo: [false], afMentalesPadre: [false], afMentalesMadre: [false], afMentalesAbuelos: [false], afMentalesTios: [false], afMentalesObs: [''],
    afTiroidesSi: [false], afTiroidesNo: [false], afTiroidesPadre: [false], afTiroidesMadre: [false], afTiroidesAbuelos: [false], afTiroidesTios: [false], afTiroidesObs: [''],
    afDemensiaSi: [false], afDemensiaNo: [false], afDemensiaPadre: [false], afDemensiaMadre: [false], afDemensiaAbuelos: [false], afDemensiaTios: [false], afDemensiaObs: [''],
    // Antecedentes personales patológicos
    ppDiabetesSi: [false], ppDiabetesNo: [false],
    ppPresionAltaSi: [false], ppPresionAltaNo: [false],
    ppPresionBajaSi: [false], ppPresionBajaNo: [false],
    ppCorazonSi: [false], ppCorazonNo: [false],
    ppVaricesSi: [false], ppVaricesNo: [false],
    ppConvulsionesSi: [false], ppConvulsionesNo: [false],
    ppMigranasSi: [false], ppMigranasNo: [false],
    ppHepatitisSi: [false], ppHepatitisNo: [false],
    ppHerniasSi: [false], ppHerniasNo: [false],
    ppAnsiedadSi: [false], ppAnsiedadNo: [false],
    ppAsmaSi: [false], ppAsmaNo: [false],
    ppTumoresSi: [false], ppTumoresNo: [false],
    ppObesidadSi: [false], ppObesidadNo: [false],
    ppColitisSi: [false], ppColitisNo: [false],
    ppGastritisSi: [false], ppGastritisNo: [false],
    ppVesiculaSi: [false], ppVesiculaNo: [false],
    ppTiroidesSi: [false], ppTiroidesNo: [false],
    ppMiopiaSi: [false], ppMiopiaNo: [false],
    ppAstigmatismoSi: [false], ppAstigmatismoNo: [false],
    // Hábitos
    tabSi: [false], tabNo: [false], tabEdad: [''], tabDiario: [false], tabSemanal: [false], tabMensual: [false], tabEsporadico: [false], tabCantidad: [''],
    alcSi: [false], alcNo: [false], alcEdad: [''], alcDiario: [false], alcSemanal: [false], alcMensual: [false], alcEsporadico: [false], alcCantidad: [''],
    droTipo: [''], droEspecifique: [''],
    aleTipo: [''], aleEspecifique: [''],
    // Cirugías y lesiones
    cirugiasSi: [false], cirugiasNo: [false], cirugiasDetalle: [''],
    tatuajesSi: [false], tatuajesNo: [false], tatuajesDetalle: [''],
    perforacionesSi: [false], perforacionesNo: [false], perforacionesDetalle: [''],
    esguincesSi: [false], esguincesNo: [false], esguincesDetalle: [''],
    luxacionesSi: [false], luxacionesNo: [false], luxacionesDetalle: [''],
    fracturasSi: [false], fracturasNo: [false], fracturasDetalle: [''],
    amputacionesSi: [false], amputacionesNo: [false], amputacionesDetalle: [''],
    partosSi: [false], partosNo: [false], partosDetalle: [''],
    cesareasSi: [false], cesareasNo: [false], cesareasDetalle: [''],
    abortosSi: [false], abortosNo: [false], abortosDetalle: [''],
  });

  evaluacionDesempenoForm: FormGroup = this.fb.group({
    nombreEmpleado: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    nombreJefe: ['', Validators.required],
    puestoEmpleado: ['', Validators.required],
    eficacia: [0, Validators.required],
    eficiencia: [0, Validators.required],
    orden: [0, Validators.required],
    limpieza: [0, Validators.required],
    asistenciaPuntualidad: [0, Validators.required],
    disciplina: [0, Validators.required],
    disponibilidad: [0, Validators.required],
    responsabilidad: [0, Validators.required],
    profesionalismo: [0, Validators.required],
    innovacion: [0, Validators.required],
    discernimiento: [0, Validators.required],
    espirituEmpresa: [0, Validators.required],
    comunicacion: [0, Validators.required],
    respeto: [0, Validators.required],
    liderazgo: [0, Validators.required],
    espirituColaboracion: [0, Validators.required],
    compromiso: [0, Validators.required],
    sentidoPertenencia: [0, Validators.required],
    comentarioEficacia: [''],
    comentarioEficiencia: [''],
    comentarioOrden: [''],
    comentarioLimpieza: [''],
    comentarioAsistenciaPuntualidad: [''],
    comentarioDisciplina: [''],
    comentarioDisponibilidad: [''],
    comentarioResponsabilidad: [''],
    comentarioProfesionalismo: [''],
    comentarioInnovacion: [''],
    comentarioDiscernimiento: [''],
    comentarioEspirituEmpresa: [''],
    comentarioComunicacion: [''],
    comentarioRespeto: [''],
    comentarioLiderazgo: [''],
    comentarioEspirituColaboracion: [''],
    comentarioCompromiso: [''],
    comentarioSentidoPertenencia: [''],
    acuerdos: [''],
  });

  // ── Catálogo EPP ────────────────────────────────────────────────────────────
  readonly eppCatalog: Record<string, { tallas: string[]; colores: string[]; marcas: string[] }> = {
    'PLAYERA':           { tallas: ['CH','M','G','XL'],               colores: ['AZUL','GRIS','NEGRA','TINTA','AZUL REY'],                          marcas: ['YAZBEK'] },
    'CHALECO':           { tallas: ['UNICA','CH','M','G','XL'],        colores: ['AZUL REY','MARINO','BEIGE'],                                       marcas: ['JOSTEIN','SAFETY DEPOT'] },
    'CASCO':             { tallas: ['UNICA'],                          colores: ['BLANCO','AZUL'],                                                   marcas: ['JOSTEIN','TRUPER'] },
    'LENTES':            { tallas: ['UNICA'],                          colores: ['TRANSPARENTES'],                                                   marcas: ['JOSTEIN','TRUPER'] },
    'GUANTES':           { tallas: ['6','8','9','10'],                 colores: ['NEGROS NITRILO','CAMEL CARNAZA','GRIS NITRILO','ANTICORTE'],       marcas: ['JOSTEIN','TRUPER'] },
    'TAPONES AUDITIVOS': { tallas: ['UNICA'],                          colores: [],                                                                  marcas: [] },
    'BOTAS':             { tallas: ['3','4','5','6','7','8','9','30'], colores: ['NEGRAS','CAFÉ'],                                                   marcas: ['LICA'] },
    'PINZAS DE CORTE':   { tallas: [],                                 colores: ['NARANJA','NEGRO'],                                                 marcas: ['TRUPER'] },
    'DESARMADORES':      { tallas: [],                                 colores: ['CRUZ','PLANO'],                                                    marcas: ['TRUPER'] },
  };

  readonly eppArticles: string[] = Object.keys(this.eppCatalog);

  onEppArticleChange(rowIndex: number, article: string): void {
    const entry = article ? this.eppCatalog[article] : null;
    this.responsivaEppForm.patchValue({
      [`fila${rowIndex}descripcion`]: article,
      [`fila${rowIndex}talla`]: entry && entry.tallas.length === 0 ? 'N/A' : '',
      [`fila${rowIndex}color`]: entry && entry.colores.length === 0 ? 'N/A' : '',
      [`fila${rowIndex}marca`]: entry && entry.marcas.length === 0 ? 'N/A' : '',
    });
  }

  getEppOptions(rowIndex: number, field: 'tallas' | 'colores' | 'marcas'): string[] {
    const article = this.responsivaEppForm.get(`fila${rowIndex}descripcion`)?.value as string;
    if (!article || !this.eppCatalog[article]) return [];
    return this.eppCatalog[article][field];
  }

  private buildLeySillaFilas(count: number) {
    return Array.from({ length: count }, () =>
      this.fb.group({
        id: [''],
        nombre: [''],
        puesto: [''],
        obra: [''],
        sillas: [''],
        fecha: [''],
      })
    );
  }

  get leySillaFilas(): FormArray {
    return this.cartaResponsivaLeySillaForm.get('filas') as FormArray;
  }

  addLeySillaFila(): void {
    this.leySillaFilas.push(this.fb.group({
      id: [''], nombre: [''], puesto: [''], obra: [''], sillas: [''], fecha: [''],
    }));
  }

  removeLeySillaFila(i: number): void {
    if (this.leySillaFilas.length > 1) {
      this.leySillaFilas.removeAt(i);
    }
  }

  calcularFechaFin(): void {
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const f = this.contratoTiempoForm;
    const dias = parseInt(f.get('diasPrueba')?.value, 10);
    const diaI = parseInt(f.get('diaInicioContrato')?.value, 10);
    const mesI = f.get('mesInicioContrato')?.value?.trim().toLowerCase();
    const anioI = parseInt(f.get('anioInicioContrato')?.value, 10);

    const mesIdx = meses.indexOf(mesI);
    if (!dias || !diaI || mesIdx === -1 || !anioI) return;

    const fechaInicio = new Date(anioI, mesIdx, diaI);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + dias - 1);

    f.patchValue({
      diaFinContrato: String(fechaFin.getDate()),
      mesFinContrato: meses[fechaFin.getMonth()],
      anioFinContrato: String(fechaFin.getFullYear()),
    });
  }

  ritForm: FormGroup = this.fb.group({
    lugar: ['Guadalajara', Validators.required],
    dia: ['', Validators.required],
    mes: ['', Validators.required],
    anio: ['2026', Validators.required],
    nombreTrabajador: ['', Validators.required],
    nombreRepresentante: ['', Validators.required],
  });

  formatSearch = '';

  get filteredFormats(): FormatItem[] {
    const q = this.formatSearch.trim().toLowerCase();
    if (!q) return this.formats;
    return this.formats.filter(f => f.label.toLowerCase().includes(q));
  }

  formats: FormatItem[] = [
    {
      key: 'entrevista-salida',
      label: 'Entrevista de Salida',
      description: 'Formulario de entrevista de salida del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/ENTREVISTA DE SALIDA.pdf',
      fileName: 'Entrevista de Salida.pdf',
      fillable: true
    },
    {
      key: 'encuesta-satisfaccion',
      label: 'Encuesta de Satisfacción Laboral',
      description: 'Encuesta de satisfacción laboral del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Encuesta de satisfacción laboral.pdf',
      fileName: 'Encuesta de Satisfacción Laboral.pdf',
      fillable: true
    },
    {
      key: 'aviso-privacidad',
      label: 'Aviso de Privacidad',
      description: 'Aviso de privacidad para el colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/AVISO DE PRIVACIDAD.pdf',
      fileName: 'Aviso de Privacidad.pdf',
      fillable: true
    },
    {
      key: 'caratula-ingreso',
      label: 'Carátula de Ingreso',
      description: 'Carátula de ingreso del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CARATULA DE INGRESO.pdf',
      fileName: 'Carátula de Ingreso.pdf',
      fillable: true
    },
    {
      key: 'carta-patronal',
      label: 'Carta Patronal',
      description: 'Carta patronal con datos de empleo, horario, salario y NSS',
      icon: 'bi-file-earmark-pdf',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'constancia-trabajo-operaciones',
      label: 'Constancia de Trabajo de Operaciones',
      description: 'Constancia de trabajo para personal de operaciones',
      icon: 'bi-file-earmark-pdf',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'constancia-abandono',
      label: 'Constancia de Abandono de Trabajo',
      description: 'Constancia de abandono de trabajo del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/constancia de abandono de trabajo.pdf',
      fileName: 'Constancia de Abandono de Trabajo.pdf',
      fillable: true
    },
    {
      key: 'contrato-confidencialidad',
      label: 'Contrato de Confidencialidad',
      description: 'Contrato de confidencialidad del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CONTRATO CONFIDENCIALIDAD.pdf',
      fileName: 'Contrato de Confidencialidad.pdf',
      fillable: true
    },
    {
      key: 'contrato-obra-determinada',
      label: 'Contrato Individual por Obra Determinada',
      description: 'Contrato individual por obra determinada del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CONTRATO INDIVIDUAL POR OBRA DETERMINADA.pdf',
      fileName: 'Contrato Individual por Obra Determinada.pdf',
      fillable: true
    },
    {
      key: 'contrato-tiempo-determinado',
      label: 'Contrato por Tiempo Determinado',
      description: 'Contrato individual por tiempo determinado sujeto a prueba',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Contrato por Tiempo Determinado.pdf',
      fileName: 'Contrato por Tiempo Determinado.pdf',
      fillable: true
    },
    {
      key: 'politica-prestamos',
      label: 'Política de Préstamos Personales',
      description: 'Política de préstamos personales para colaboradores',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/POLITICA DE PRESTAMOS PERSONALES.pdf',
      fileName: 'Política de Préstamos Personales.pdf',
      fillable: true
    },
    {
      key: 'solicitud-prestamo',
      label: 'Solicitud de Préstamo',
      description: 'Formato de solicitud de préstamo personal para colaboradores',
      icon: 'bi-file-earmark-text',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'politica-bono-permanencia',
      label: 'Política de Bono por Permanencia',
      description: 'Política de bono por permanencia para colaboradores',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/POLITICA DE BONO POR PERMANENCIA.pdf',
      fileName: 'Política de Bono por Permanencia.pdf',
      fillable: true
    },
    {
      key: 'solicitud-bono-permanencia',
      label: 'Solicitud de Bono por Permanencia',
      description: 'Formato de solicitud de bono por permanencia para colaboradores',
      icon: 'bi-file-earmark-text',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'solicitud-bono-recomendacion',
      label: 'Solicitud de Bono por Recomendación',
      description: 'Formato de solicitud de bono por recomendación para colaboradores',
      icon: 'bi-file-earmark-text',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'renuncia-laboral',
      label: 'Renuncia Laboral',
      description: 'Formato de renuncia laboral del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/RENUNCIA LABORAL.pdf',
      fileName: 'Renuncia Laboral.pdf',
      fillable: true
    },
    {
      key: 'responsiva-epp',
      label: 'Responsiva Entrega de EPP',
      description: 'Responsiva de entrega de equipo de protección personal',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Responsiva Entrega de EPP.pdf',
      fileName: 'Responsiva Entrega de EPP.pdf',
      fillable: true
    },
    {
      key: 'responsiva-llaves',
      label: 'Responsiva Llaves',
      description: 'Responsiva de entrega de llaves al colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Responsiva Llaves.pdf',
      fileName: 'Responsiva Llaves.pdf',
      fillable: true
    },
    {
      key: 'rit',
      label: 'RIT — Reglamento Interior de Trabajo',
      description: 'Reglamento interior de trabajo de la empresa',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/RIT Reglamento interior de trabajo.pdf',
      fileName: 'RIT Reglamento Interior de Trabajo.pdf',
      fillable: true
    },
    {
      key: 'anexo-rit',
      label: 'Anexo a RIT — Listado de Sanciones por Infracción',
      description: 'Anexo 1 del Reglamento Interior de Trabajo con listado de sanciones',
      icon: 'bi-file-earmark-pdf',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'contrato-tiempo-indeterminado',
      label: 'Contrato por Tiempo Indeterminado',
      description: 'Contrato individual de trabajo por tiempo indeterminado',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/C.ontrato por tiempo Indeterminado.pdf',
      fileName: 'Contrato por Tiempo Indeterminado.pdf',
      fillable: true
    },
    {
      key: 'carta-responsiva-ley-silla',
      label: 'Carta Responsiva Ley Silla',
      description: 'Carta responsiva de asignación de silla conforme a Ley Silla (LFT/STPS)',
      icon: 'bi-file-earmark-pdf',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'carta-terminacion-contrato',
      label: 'Carta de Terminación de Contrato',
      description: 'Carta de aviso de terminación de contrato individual de trabajo',
      icon: 'bi-file-earmark-pdf',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'cuestionario-medico',
      label: 'Cuestionario Médico',
      description: 'Cuestionario de antecedentes médicos familiares y personales del colaborador',
      icon: 'bi-file-earmark-medical',
      filePath: '',
      fileName: '',
      fillable: true
    },
    {
      key: 'evaluacion-desempeno',
      label: 'Evaluación del Desempeño',
      description: 'Evaluación del desempeño del colaborador al término del periodo de prueba',
      icon: 'bi-clipboard2-check',
      filePath: '',
      fileName: '',
      fillable: true
    }
  ];

  handleAction(format: FormatItem): void {
    if (format.fillable) {
      this.activeFormatKey = format.key;
      this.clearSearch();
      const now = new Date();
      const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const diaActual = String(now.getDate());
      const mesActual = meses[now.getMonth()];
      const anioActual = String(now.getFullYear());
      this.entrevistaForm.reset();
      this.renunciaForm.reset({ ciudad: 'Guadalajara', estado: 'Jalisco', dia: diaActual, mes: mesActual, anio: anioActual });
      this.encuestaForm.reset();
      this.avisoForm.reset();
      this.caratulaForm.reset({ nombreEmpresa1: 'INTEC DE JALISCO S.A. DE C.V.' });
      this.cartaPatronalForm.reset({ ciudad: 'Guadalajara', estado: 'Jalisco', dia: diaActual, mes: mesActual, anio: anioActual, nombreFirmante: 'Lic. María Asunción Mares Magallanes', cargoFirmante: 'Coordinadora de Capital Humano' });
      this.constanciaTrabajoOperacionesForm.reset({ ciudad: 'Guadalajara', dia: diaActual, mes: mesActual, anio: anioActual, anioInicio: '2025', anioFin: anioActual, nombreFirmante: 'Lic. María Asunción Mares Magallanes', cargoFirmante: 'Coordinador de R.H.', celFirmante: '3324951222' });
      this.contratoConfForm.reset();
      this.contratoObraForm.reset({ ciudad: 'Guadalajara', estado: 'Jalisco', dia: diaActual, mes: mesActual, anio: anioActual, nacionalidad: 'Mexicana' });
      this.contratoTiempoForm.reset({ ciudad: 'Guadalajara', estado: 'Jalisco', dia: diaActual, mes: mesActual, anio: anioActual, nacionalidad: 'Mexicana', anioInicioContrato: anioActual, anioFinContrato: anioActual });
      this.politicaPrestamosForm.reset();
      this.politicaBonoForm.reset();
      this.responsivaEppForm.reset();
      this.responsivaLlavesForm.reset({ dia: diaActual, mes: mesActual, anio: anioActual });
      this.ritForm.reset({ lugar: 'Guadalajara', dia: diaActual, mes: mesActual, anio: anioActual });
      this.actaAbandonoForm.reset({
        dia: diaActual,
        mes: mesActual,
        anio: anioActual,
        horas: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
        domicilioEmpresa: 'Misioneros número 2138 Colonia Jardines del Country en Guadalajara, Jalisco con C.P.44210',
      });
      this.anexoRitForm.reset();
      this.contratoIndeterminadoForm.reset({ ciudad: 'Guadalajara', municipioComparecencia: 'Zapopan', estadoComparecencia: 'Jalisco', nacionalidad: 'Mexicana', dia: diaActual, mes: mesActual, anio: anioActual, anioInicio: anioActual });
      this.cartaTerminacionContratoForm.reset({ ciudad: 'Guadalajara', estado: 'Jalisco', dia: diaActual, mes: mesActual, nombreFirmante: 'Ing. Juan Pablo Jimenez Espinoza.' });
      this.solicitudPrestamoForm.reset({ formaPago: 'Semanal' });
      this.solicitudBonoPermanenciaForm.reset();
      this.solicitudBonoRecomendacionForm.reset();
      this.cuestionarioMedicoForm.reset({ nombre: '', fecha: now.toISOString().split('T')[0] });
      this.evaluacionDesempenoForm.reset({ eficacia: 0, eficiencia: 0, orden: 0, limpieza: 0, asistenciaPuntualidad: 0, disciplina: 0, disponibilidad: 0, responsabilidad: 0, profesionalismo: 0, innovacion: 0, discernimiento: 0, espirituEmpresa: 0, comunicacion: 0, respeto: 0, liderazgo: 0, espirituColaboracion: 0, compromiso: 0, sentidoPertenencia: 0, acuerdos: '' });
      const filasArray = this.cartaResponsivaLeySillaForm.get('filas') as FormArray;
      filasArray.clear();
      this.buildLeySillaFilas(10).forEach(g => filasArray.push(g));
      this.showModal = true;
    } else {
      const link = document.createElement('a');
      link.href = format.filePath;
      link.download = format.fileName;
      link.click();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.activeFormatKey = '';
    this.clearSearch();
  }

  get activeForm(): FormGroup {
    if (this.activeFormatKey === 'entrevista-salida') return this.entrevistaForm;
    if (this.activeFormatKey === 'encuesta-satisfaccion') return this.encuestaForm;
    if (this.activeFormatKey === 'aviso-privacidad') return this.avisoForm;
    if (this.activeFormatKey === 'caratula-ingreso') return this.caratulaForm;
    if (this.activeFormatKey === 'carta-patronal') return this.cartaPatronalForm;
    if (this.activeFormatKey === 'constancia-trabajo-operaciones') return this.constanciaTrabajoOperacionesForm;
    if (this.activeFormatKey === 'contrato-confidencialidad') return this.contratoConfForm;
    if (this.activeFormatKey === 'contrato-obra-determinada') return this.contratoObraForm;
    if (this.activeFormatKey === 'contrato-tiempo-determinado') return this.contratoTiempoForm;
    if (this.activeFormatKey === 'politica-prestamos') return this.politicaPrestamosForm;
    if (this.activeFormatKey === 'politica-bono-permanencia') return this.politicaBonoForm;
    if (this.activeFormatKey === 'responsiva-epp') return this.responsivaEppForm;
    if (this.activeFormatKey === 'responsiva-llaves') return this.responsivaLlavesForm;
    if (this.activeFormatKey === 'rit') return this.ritForm;
    if (this.activeFormatKey === 'constancia-abandono') return this.actaAbandonoForm;
    if (this.activeFormatKey === 'anexo-rit') return this.anexoRitForm;
    if (this.activeFormatKey === 'contrato-tiempo-indeterminado') return this.contratoIndeterminadoForm;
    if (this.activeFormatKey === 'carta-responsiva-ley-silla') return this.cartaResponsivaLeySillaForm;
    if (this.activeFormatKey === 'carta-terminacion-contrato') return this.cartaTerminacionContratoForm;
    if (this.activeFormatKey === 'solicitud-prestamo') return this.solicitudPrestamoForm;
    if (this.activeFormatKey === 'solicitud-bono-permanencia') return this.solicitudBonoPermanenciaForm;
    if (this.activeFormatKey === 'solicitud-bono-recomendacion') return this.solicitudBonoRecomendacionForm;
    if (this.activeFormatKey === 'cuestionario-medico') return this.cuestionarioMedicoForm;
    if (this.activeFormatKey === 'evaluacion-desempeno') return this.evaluacionDesempenoForm;
    return this.renunciaForm;
  }

  async submitForm(): Promise<void> {
    this.activeForm.markAllAsTouched();
    if (this.activeForm.invalid) return;

    this.isGenerating = true;
    try {
      if (this.activeFormatKey === 'entrevista-salida') {
        await this.entrevistaService.generate(this.entrevistaForm.value);
      } else if (this.activeFormatKey === 'renuncia-laboral') {
        await this.renunciaService.generate(this.renunciaForm.value);
      } else if (this.activeFormatKey === 'encuesta-satisfaccion') {
        await this.encuestaService.generate(this.encuestaForm.value);
      } else if (this.activeFormatKey === 'aviso-privacidad') {
        await this.avisoService.generate(this.avisoForm.value);
      } else if (this.activeFormatKey === 'caratula-ingreso') {
        await this.caratulaService.generate(this.caratulaForm.value);
      } else if (this.activeFormatKey === 'carta-patronal') {
        await this.cartaPatronalService.generate(this.cartaPatronalForm.value);
      } else if (this.activeFormatKey === 'constancia-trabajo-operaciones') {
        await this.constanciaTrabajoOperacionesService.generate(this.constanciaTrabajoOperacionesForm.value);
      } else if (this.activeFormatKey === 'contrato-confidencialidad') {
        await this.contratoConfService.generate(this.contratoConfForm.value);
      } else if (this.activeFormatKey === 'contrato-obra-determinada') {
        await this.contratoObraService.generate(this.contratoObraForm.value);
      } else if (this.activeFormatKey === 'contrato-tiempo-determinado') {
        await this.contratoTiempoService.generate(this.contratoTiempoForm.value);
      } else if (this.activeFormatKey === 'politica-prestamos') {
        await this.politicaPrestamosService.generate(this.politicaPrestamosForm.value);
      } else if (this.activeFormatKey === 'politica-bono-permanencia') {
        await this.politicaBonoPermanenciaService.generate(this.politicaBonoForm.value);
      } else if (this.activeFormatKey === 'responsiva-epp') {
        const ev = this.responsivaEppForm.value;
        await this.responsivaEppService.generate({
          fecha: ev.fecha,
          nombre: ev.nombre,
          ciudad: ev.ciudad,
          estado: ev.estado,
          filas: [0, 1, 2, 3, 4].map(i => ({
            cantidad: ev[`fila${i}cantidad`] ?? '',
            descripcion: ev[`fila${i}descripcion`] ?? '',
            talla: ev[`fila${i}talla`] ?? '',
            color: ev[`fila${i}color`] ?? '',
            marca: ev[`fila${i}marca`] ?? '',
          })),
        });
      } else if (this.activeFormatKey === 'responsiva-llaves') {
        await this.responsivaLlavesService.generate(this.responsivaLlavesForm.value);
      } else if (this.activeFormatKey === 'rit') {
        await this.ritService.generate(this.ritForm.value);
      } else if (this.activeFormatKey === 'constancia-abandono') {
        await this.actaAbandonoService.generate(this.actaAbandonoForm.value);
      } else if (this.activeFormatKey === 'anexo-rit') {
        await this.anexoRitService.generate(this.anexoRitForm.value);
      } else if (this.activeFormatKey === 'contrato-tiempo-indeterminado') {
        await this.contratoIndeterminadoService.generate(this.contratoIndeterminadoForm.value);
      } else if (this.activeFormatKey === 'carta-responsiva-ley-silla') {
        await this.cartaResponsivaLeySillaService.generate({
          ciudad: this.cartaResponsivaLeySillaForm.get('ciudad')?.value ?? '',
          estado: this.cartaResponsivaLeySillaForm.get('estado')?.value ?? '',
          filas: this.leySillaFilas.value,
        });
      } else if (this.activeFormatKey === 'carta-terminacion-contrato') {
        await this.cartaTerminacionContratoService.generate(this.cartaTerminacionContratoForm.value);
      } else if (this.activeFormatKey === 'solicitud-prestamo') {
        await this.solicitudPrestamoService.generate(this.solicitudPrestamoForm.value);
        await this.saveLoanRequest(this.solicitudPrestamoForm.value);
      } else if (this.activeFormatKey === 'solicitud-bono-permanencia') {
        await this.solicitudBonoPermanenciaService.generate(this.solicitudBonoPermanenciaForm.value);
        try {
          await this.saveBondApplication(this.solicitudBonoPermanenciaForm.value);
        } catch (err) {
          console.error('Error al guardar bono por permanencia:', err);
        }
      } else if (this.activeFormatKey === 'solicitud-bono-recomendacion') {
        await this.solicitudBonoRecomendacionService.generate(this.solicitudBonoRecomendacionForm.value);
        try {
          await this.saveBondRecommendation(this.solicitudBonoRecomendacionForm.value);
        } catch (err) {
          console.error('Error al guardar bono por recomendación:', err);
        }
      } else if (this.activeFormatKey === 'cuestionario-medico') {
        try {
          await this.cuestionarioMedicoService.generate(this.cuestionarioMedicoForm.value);
        } catch (err) {
          console.error('Error generando Cuestionario Médico:', err);
        }
      } else if (this.activeFormatKey === 'evaluacion-desempeno') {
        try {
          await this.evaluacionDesempenoService.generate(this.evaluacionDesempenoForm.value);
        } catch (err) {
          console.error('Error generando Evaluación de Desempeño:', err);
        }
      }
      this.closeModal();
    } finally {
      this.isGenerating = false;
    }
  }

  private async saveLoanRequest(formValue: any): Promise<void> {
    const id_loan = `PREST-${Date.now()}`;
    const loanRequest: LoanRequest = {
      id_loan,
      id_employee: this.selectedLoanEmployeeId,
      operative_owner: formValue.duenioOperativo,
      executive_owner: formValue.duenioEjecutivo,
      approval_date: formValue.fechaAprobacion,
      effective_date: formValue.entradaVigencia,
      employee_name: formValue.nombre,
      position: formValue.puesto,
      hire_date: formValue.fechaIngreso,
      requested_amount: Number(formValue.montoSolicitado),
      authorized_amount: Number(formValue.montoAutorizado),
      loan_reason: formValue.motivoPrestamo,
      payment_method: formValue.formaPago,
      payment_count: Number(formValue.numPagos),
      first_payment_date: formValue.fechaInicioPago,
      status: true,
    };

    await firstValueFrom(this.loanRequestAdapter.post(loanRequest));

    const payments: LoanPayment[] = this.buildPaymentSchedule(
      id_loan,
      formValue.fechaInicioPago,
      Number(formValue.numPagos),
      Number(formValue.montoAutorizado),
      formValue.formaPago
    );

    if (payments.length > 0) {
      await firstValueFrom(this.loanPaymentAdapter.post(payments));
    }
  }

  private toIsoSafe(date: string): string {
    if (!date) return '';
    // Ya está en formato yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Viene en dd/mm/yyyy
    return this.displayToIso(date);
  }

  private async saveBondApplication(formValue: any): Promise<void> {
    const id_bond = `BONO-${Date.now()}`;
    const bond: BondApplication = {
      id_bond,
      id_employee: this.selectedBondEmployeeId,
      employee_name: formValue.nombreEmpleado,
      hire_date: this.toIsoSafe(formValue.fechaIngreso),
      contract_date: this.toIsoSafe(formValue.fechaContratacion),
      bond_amount: Number(formValue.bono),
      payment_date: this.toIsoSafe(formValue.fechaPago),
      observations: formValue.observaciones ?? '',
      direct_boss_signature: '',
      rh_signature: '',
      status: true,
    };
    await firstValueFrom(this.bondApplicationAdapter.post(bond));
  }

  private async saveBondRecommendation(formValue: any): Promise<void> {
    const id_bond_rec = `BONOREC-${Date.now()}`;
    const bond: BondRecommendation = {
      id_bond_rec,
      id_employee: this.selectedBondRecEmployeeId,
      employee_name: formValue.nombreEmpleado,
      hire_date: this.toIsoSafe(formValue.fechaIngreso),
      recommended_person: formValue.personaRecomendada,
      contract_date: this.toIsoSafe(formValue.fechaContratacion),
      bond_amount: Number(formValue.bono),
      payment_date: this.toIsoSafe(formValue.fechaPago),
      observations: formValue.observaciones ?? '',
      direct_boss_signature: '',
      rh_signature: '',
      status: true,
    };
    await firstValueFrom(this.bondRecommendationAdapter.post(bond));
  }

  private buildPaymentSchedule(
    id_loan: string,
    fechaInicio: string,
    numPagos: number,
    authorizedAmount: number,
    paymentMethod: string
  ): LoanPayment[] {
    const payments: LoanPayment[] = [];
    const paymentAmount = Number((authorizedAmount / numPagos).toFixed(2));

    const parts = fechaInicio.split('/');
    let current: Date;
    if (parts.length === 3) {
      current = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      current = new Date(fechaInicio);
    }

    const incrementDays = paymentMethod === 'Quincenal' ? 15 : paymentMethod === 'Mensual' ? 30 : 7;

    for (let i = 0; i < numPagos; i++) {
      const paymentDate = current.toISOString().split('T')[0];
      payments.push({
        id_payment: `PAG-${id_loan}-${i + 1}`,
        id_loan,
        payment_date: paymentDate,
        payment_amount: paymentAmount,
        paid: false,
        status: true,
      });
      current = new Date(current.getTime() + incrementDays * 24 * 60 * 60 * 1000);
    }

    return payments;
  }
}
