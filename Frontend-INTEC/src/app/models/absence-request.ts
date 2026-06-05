export interface AbsenceRequest {
    id?: string;
    id_employee: string;
    type: 'Vacaciones' | 'Permiso' | 'Incapacidad';
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
    description?: string;
    with_pay: boolean;
    vacation_year?: number | null;
    document_url?: string;
    request_date: string;
    return_to_work_date?: string;
    employee?: {
        name_employee: string;
        employee_code?: string;
        [key: string]: any;
    };
}
