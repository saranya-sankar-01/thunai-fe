export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    reports_to_id: string | null;
    reports_to_name: string | null;
    reports_to: string | any[];
    reports_to_email: {
        email: string;
        user_id: string;
    };
    user_id: string;
}