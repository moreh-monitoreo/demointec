export interface Disability {
    id?: number;
    id_employee: string;
    name?: string;
    admission_date?: string;
    position?: string;
    location?: string;
    start_date: string;
    folio?: string;
    days: number;
    end_date: string;
    type: string;
    insurance_branch?: string;
    eg?: boolean;
    rt?: boolean;
    at_field?: boolean;
    st7?: boolean;
    st2?: boolean;
    return_to_work_date?: string | null;
    document_path?: string;
    document_name?: string;
    created_at?: Date;
    updated_at?: Date;
    employee?: {
        name_employee: string;
        [key: string]: any;
    };
}
