import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: CreateUserDto): Promise<{
        username: string;
        email: string;
        fullName: string;
        admin: boolean;
        isSuperAdmin: boolean;
        cellPhone: string;
        mustChangePassword: boolean;
        _id: import("mongoose").Types.ObjectId;
        __v: number;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
