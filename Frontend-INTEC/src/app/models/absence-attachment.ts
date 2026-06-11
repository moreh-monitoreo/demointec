export interface AbsenceAttachment {
    id?: number;
    id_employee: string;
    reference_type: string;
    reference_id: string;
    file_url: string;
    file_name: string;
    created_at?: Date;
}
