export declare enum UserRole {
    Admin = "admin",
    User = "user",
    SuperAdmin = "superAdmin"
}
export declare class UpdateUserDto {
    username?: string;
    password?: string;
    email?: string;
    fullName?: string;
    cellPhone?: string;
    admin?: boolean;
    isSuperAdmin?: boolean;
    mustChangePassword?: boolean;
}
