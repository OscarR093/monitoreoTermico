import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<Omit<import("./schemas/user.schema").User, "password">[]>;
    findOne(id: string): Promise<Omit<import("./schemas/user.schema").User, "password"> | (import("mongoose").Document<unknown, {}, Omit<import("./schemas/user.schema").User, "password">, {}, {}> & Omit<import("./schemas/user.schema").User, "password"> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<import("./schemas/user.schema").User, "password"> | null>;
    remove(id: string): Promise<void>;
}
