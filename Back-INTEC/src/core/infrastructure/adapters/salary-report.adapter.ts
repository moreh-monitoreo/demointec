import { SalaryReportRepository } from "../../domain/repository/salary-report.repository";
import { EmployeeEntity } from "../entity/employees.entity";
import database from "../../../config/db";

export class SalaryReportAdapterRepository implements SalaryReportRepository {

    async list(): Promise<any[]> {
        const employeeRepo = database.getRepository(EmployeeEntity);

        const employees = await employeeRepo.find({
            where: { status: true, is_dev: false },
            select: [
                'id_employee',
                'employee_code',
                'name_employee',
                'admission_date',
                'position',
                'base_salary',
            ],
            order: { position: 'ASC', name_employee: 'ASC' }
        });

        return employees.map(emp => ({
            id_employee: emp.employee_code,
            name_employee: emp.name_employee,
            admission_date: emp.admission_date,
            position: emp.position,
            base_salary: emp.base_salary,
        }));
    }
}
