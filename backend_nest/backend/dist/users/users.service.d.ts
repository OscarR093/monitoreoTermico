import { Model, HydratedDocument } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private userModel;
    private configService;
    constructor(userModel: Model<UserDocument>, configService: ConfigService);
    create(dto: CreateUserDto): Promise<HydratedDocument<User>>;
    findAll(): Promise<Omit<User, 'password'>[]>;
    findById(id: string, options?: {
        lean?: boolean;
    }): Promise<Omit<User, 'password'> | HydratedDocument<Omit<User, 'password'>> | null>;
    findByUsername(username: string, options?: {
        lean?: boolean;
    }): Promise<User | HydratedDocument<User> | null>;
    update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'> | null>;
    remove(id: string): Promise<boolean>;
}
