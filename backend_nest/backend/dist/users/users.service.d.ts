import { Model, HydratedDocument } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private userModel;
    private configService;
    constructor(userModel: Model<UserDocument>, configService: ConfigService);
    create(dto: CreateUserDto): Promise<HydratedDocument<User>>;
    findByUsername(username: string, options?: {
        lean?: boolean;
    }): Promise<User | HydratedDocument<User> | null>;
    findById(id: string, options?: {
        lean?: boolean;
    }): Promise<User | HydratedDocument<User> | null>;
}
