import database from "../../../config/db";
import { PrenominaRepository } from "../../domain/repository/prenomina.repository";
import { EmployeeEntity } from "../entity/employees.entity";
import { AttendanceEntity } from "../entity/attendances.entity";
import { AbsenceRequestEntity } from "../entity/absence-request.entity";
import { LoanRequestEntity } from "../entity/loan_request.entity";
import { LoanPaymentEntity } from "../entity/loan_payment.entity";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export class PrenominaAdapterRepository implements PrenominaRepository {

  async getList(startDate: string, endDate: string): Promise<any[]> {
    const employeeRepo = database.getRepository(EmployeeEntity);
    const attendanceRepo = database.getRepository(AttendanceEntity);
    const absenceRepo = database.getRepository(AbsenceRequestEntity);
    const loanRequestRepo = database.getRepository(LoanRequestEntity);
    const loanPaymentRepo = database.getRepository(LoanPaymentEntity);

    const employees = await employeeRepo.find({
      where: { status: true },
      select: ['id_employee', 'name_employee', 'project'],
    });

    const attendances = await attendanceRepo
      .createQueryBuilder('a')
      .where('a.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('a.status = :status', { status: true })
      .getMany();

    const absences = await absenceRepo.find({
      where: {
        start_date: LessThanOrEqual(endDate),
        end_date: MoreThanOrEqual(startDate)
      }
    });

    // Obtener préstamos y pagos pendientes — si las tablas aún no existen no rompe la prenómina
    const loanPaymentMap = new Map<string, LoanPaymentEntity>();
    try {
      const loanRequests = await loanRequestRepo.find({
        where: { status: true },
        select: ['id_loan', 'id_employee'],
      });

      const loanEmployeeMap = new Map<string, string>();
      for (const loan of loanRequests) {
        loanEmployeeMap.set(loan.id_loan, loan.id_employee);
      }

      const loanPayments = await loanPaymentRepo
        .createQueryBuilder('lp')
        .where('lp.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('lp.paid = :paid', { paid: false })
        .andWhere('lp.status = :status', { status: true })
        .getMany();

      for (const payment of loanPayments) {
        const idEmployee = loanEmployeeMap.get(payment.id_loan);
        if (idEmployee) {
          const key = `${idEmployee}_${payment.payment_date}`;
          loanPaymentMap.set(key, payment);
        }
      }
    } catch {
      // Las tablas de préstamos aún no existen en BD — se omite el cruce
    }

    const attendanceMap = new Map<string, AttendanceEntity[]>();
    for (const att of attendances) {
      const dateKey = String(att.date);
      const key = `${att.uuid}_${dateKey}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, []);
      }
      attendanceMap.get(key)!.push(att);
    }

    const dates = this.getDateRange(startDate, endDate);
    const results: any[] = [];

    for (const employee of employees) {
      for (const dateKey of dates) {
        const key = `${employee.id_employee}_${dateKey}`;
        const dayAttendances = attendanceMap.get(key) || [];

        const entrada = dayAttendances.find(a => a.type === 'Entrada');
        const salida = dayAttendances.find(a => a.type === 'Salida');

        let status = entrada ? 'En Obra' : 'Falta';

        if (!entrada) {
          const absence = absences.find(a =>
            a.id_employee === employee.id_employee &&
            dateKey >= String(a.start_date) &&
            dateKey <= String(a.end_date)
          );
          if (absence) {
            status = absence.type;
          }
        }

        const loanPayment = loanPaymentMap.get(`${employee.id_employee}_${dateKey}`);

        results.push({
          name_employee: employee.name_employee,
          project: employee.project || '',
          date: dateKey,
          status,
          entry_time: entrada ? entrada.hour : null,
          exit_time: salida ? salida.hour : null,
          loan_discount: loanPayment ? Number(loanPayment.payment_amount) : null,
          loan_id_payment: loanPayment ? loanPayment.id_payment : null,
        });
      }
    }

    return results;
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const current = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}
