import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'employees' })
export class EmployeeEntity {
  @PrimaryColumn({ name: 'id_employee', type: 'varchar', length: 255 })
  id_employee!: string;

  @Column({ name: 'name_employee', type: 'varchar', length: 100 })
  name_employee!: string;

  @Column({ name: 'employee_code', type: 'varchar', length: 50, nullable: true })
  employee_code!: string;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ name: 'phone', type: 'varchar', length: 100 })
  phone!: string;

  @Column({ name: 'role', type: 'varchar', length: 100 })
  role!: string;

  @Column({ name: 'admission_date', type: 'varchar', length: 100, nullable: true })
  admission_date!: string;

  @Column({ name: 'imss_registration_date', type: 'varchar', length: 100, nullable: true })
  imss_registration_date!: string;

  @Column({ name: 'position', type: 'varchar', length: 100, nullable: true })
  position!: string;

  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location!: string;

  @Column({ name: 'entry_time', type: 'varchar', length: 50, nullable: true })
  entry_time!: string;

  @Column({ name: 'exit_time', type: 'varchar', length: 50, nullable: true })
  exit_time!: string;

  @Column({ name: 'gender', type: 'varchar', length: 50, nullable: true })
  gender!: string;

  @Column({ name: 'age', type: 'int', nullable: true })
  age!: number;

  @Column({ name: 'marital_status', type: 'varchar', length: 50, nullable: true })
  marital_status!: string;

  @Column({ name: 'education_level', type: 'varchar', length: 100, nullable: true })
  education_level!: string;

  @Column({ name: 'education_status', type: 'varchar', length: 100, nullable: true })
  education_status!: string;

  @Column({ name: 'ine_code', type: 'varchar', length: 100, nullable: true })
  ine_code!: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string;

  @Column({ name: 'street', type: 'varchar', length: 150, nullable: true })
  street!: string;

  @Column({ name: 'outdoor_number', type: 'varchar', length: 50, nullable: true })
  outdoor_number!: string;

  @Column({ name: 'interior_number', type: 'varchar', length: 50, nullable: true })
  interior_number!: string;

  @Column({ name: 'colony', type: 'varchar', length: 100, nullable: true })
  colony!: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true })
  zip_code!: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city!: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state!: string;

  @Column({ name: 'birth_place', type: 'varchar', length: 100, nullable: true })
  birth_place!: string;

  @Column({ name: 'birth_date', type: 'varchar', length: 100, nullable: true })
  birth_date!: string;

  @Column({ name: 'nss', type: 'varchar', length: 50, nullable: true })
  nss!: string;

  @Column({ name: 'rfc', type: 'varchar', length: 50, nullable: true })
  rfc!: string;

  @Column({ name: 'curp', type: 'varchar', length: 50, nullable: true })
  curp!: string;

  @Column({ name: 'children_count', type: 'int', nullable: true })
  children_count!: number;

  @Column({ name: 'child1_name', type: 'varchar', length: 100, nullable: true })
  child1_name!: string;

  @Column({ name: 'child1_birth_date', type: 'varchar', length: 100, nullable: true })
  child1_birth_date!: string;

  @Column({ name: 'child2_name', type: 'varchar', length: 100, nullable: true })
  child2_name!: string;

  @Column({ name: 'child2_birth_date', type: 'varchar', length: 100, nullable: true })
  child2_birth_date!: string;

  @Column({ name: 'child3_name', type: 'varchar', length: 100, nullable: true })
  child3_name!: string;

  @Column({ name: 'child3_birth_date', type: 'varchar', length: 100, nullable: true })
  child3_birth_date!: string;

  @Column({ name: 'child4_name', type: 'varchar', length: 100, nullable: true })
  child4_name!: string;

  @Column({ name: 'child4_birth_date', type: 'varchar', length: 100, nullable: true })
  child4_birth_date!: string;

  @Column({ name: 'child5_name', type: 'varchar', length: 100, nullable: true })
  child5_name!: string;

  @Column({ name: 'child5_birth_date', type: 'varchar', length: 100, nullable: true })
  child5_birth_date!: string;

  @Column({ name: 'beneficiaries_count', type: 'int', nullable: true })
  beneficiaries_count!: number;

  @Column({ name: 'beneficiary', type: 'varchar', length: 100, nullable: true })
  beneficiary!: string;

  @Column({ name: 'beneficiary_relationship', type: 'varchar', length: 100, nullable: true })
  beneficiary_relationship!: string;

  @Column({ name: 'beneficiary_percentage', type: 'varchar', length: 50, nullable: true })
  beneficiary_percentage!: string;

  @Column({ name: 'beneficiary2_name', type: 'varchar', length: 100, nullable: true })
  beneficiary2_name!: string;

  @Column({ name: 'beneficiary2_relationship', type: 'varchar', length: 100, nullable: true })
  beneficiary2_relationship!: string;

  @Column({ name: 'beneficiary2_percentage', type: 'varchar', length: 50, nullable: true })
  beneficiary2_percentage!: string;

  @Column({ name: 'beneficiary3_name', type: 'varchar', length: 100, nullable: true })
  beneficiary3_name!: string;

  @Column({ name: 'beneficiary3_relationship', type: 'varchar', length: 100, nullable: true })
  beneficiary3_relationship!: string;

  @Column({ name: 'beneficiary3_percentage', type: 'varchar', length: 50, nullable: true })
  beneficiary3_percentage!: string;

  @Column({ name: 'infonavit_credit_number', type: 'varchar', length: 100, nullable: true })
  infonavit_credit_number!: string;

  @Column({ name: 'infonavit_factor', type: 'varchar', length: 50, nullable: true })
  infonavit_factor!: string;

  @Column({ name: 'blood_type', type: 'varchar', length: 10, nullable: true })
  blood_type!: string;

  @Column({ name: 'weight', type: 'varchar', length: 20, nullable: true })
  weight!: string;

  @Column({ name: 'height', type: 'varchar', length: 20, nullable: true })
  height!: string;

  @Column({ name: 'shirt_size', type: 'varchar', length: 20, nullable: true })
  shirt_size!: string;

  @Column({ name: 'diseases', type: 'text', nullable: true })
  diseases!: string;

  @Column({ name: 'contract_expiration', type: 'varchar', length: 20, nullable: true })
  contract_expiration!: string;

  @Column({ name: 'emergency_phone', type: 'varchar', length: 50, nullable: true })
  emergency_phone!: string;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100, nullable: true })
  emergency_contact_name!: string;

  @Column({ name: 'emergency_contact_relationship', type: 'varchar', length: 100, nullable: true })
  emergency_contact_relationship!: string;

  @Column({ name: 'allergies', type: 'text', nullable: true })
  allergies!: string;

  @Column({ name: 'pAut1', type: 'varchar', length: 10, default: '0' })
  pAut1!: string;

  @Column({ name: 'pAut2', type: 'varchar', length: 10, default: '0' })
  pAut2!: string;

  @Column({ name: 'pAut3', type: 'varchar', length: 10, default: '0' })
  pAut3!: string;

  @Column({ name: 'pCapSol', type: 'varchar', length: 10, default: '0' })
  pCapSol!: string;

  @Column({ name: 'pComSol', type: 'varchar', length: 10, default: '0' })
  pComSol!: string;

  @Column({ name: 'pControlSol', type: 'varchar', length: 10, default: '0' })
  pControlSol!: string;

  @Column({ name: 'pEdCats', type: 'varchar', length: 10, default: '0' })
  pEdCats!: string;

  @Column({ name: 'pEdSol', type: 'varchar', length: 10, default: '0' })
  pEdSol!: string;

  @Column({ name: 'pEstadisticas', type: 'varchar', length: 10, default: '0' })
  pEstadisticas!: string;

  @Column({ name: 'pHistorial', type: 'varchar', length: 10, default: '0' })
  pHistorial!: string;

  @Column({ name: 'pUsuarios', type: 'varchar', length: 10, default: '0' })
  pUsuarios!: string;

  @Column({ name: 'pVerCats', type: 'varchar', length: 10, default: '0' })
  pVerCats!: string;

  @Column({ name: 'pEliminarDocsRH', type: 'varchar', length: 10, default: '0' })
  pEliminarDocsRH!: string;

  @Column({ name: 'pDescripcionesPuestos', type: 'varchar', length: 10, default: '0' })
  pDescripcionesPuestos!: string;

  @Column({ name: 'pPermisosVacaciones', type: 'varchar', length: 10, default: '0' })
  pPermisosVacaciones!: string;

  @Column({ name: 'pAlertaContratos', type: 'varchar', length: 10, default: '0' })
  pAlertaContratos!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @Column({ name: 'imss_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
  imss_salary!: number;

  @Column({ name: 'base_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_salary!: number;

  @Column({ name: 'bonuses', type: 'text', nullable: true })
  bonuses!: string;

  @Column({ name: 'contract_type', type: 'varchar', length: 50, nullable: true })
  contract_type!: string;

  @Column({ name: 'rehire_date', type: 'varchar', length: 100, nullable: true })
  rehire_date!: string;

  @Column({ name: 'rehire_document_path', type: 'varchar', length: 255, nullable: true })
  rehire_document_path!: string;

  @Column({ name: 'rehire_document_name', type: 'varchar', length: 255, nullable: true })
  rehire_document_name!: string;

  @Column({ name: 'project', type: 'varchar', length: 255, nullable: true })
  project!: string;

  @Column({ name: 'is_dev', type: 'boolean', default: false })
  is_dev!: boolean;

}

