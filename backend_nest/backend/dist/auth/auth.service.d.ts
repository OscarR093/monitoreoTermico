import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schemas/user.schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<Omit<User, 'password'> | null>;
    login(user: Omit<User, 'password'>): Promise<{
        access_token: string;
    }>;
}
