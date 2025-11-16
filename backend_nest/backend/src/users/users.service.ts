import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) { }

  /**
   * Creates a new user with encrypted password
   * @param dto User data from request
   * @returns The created user document (without password)
   * @throws ConflictException if username or email already exists
   */
  async create(dto: CreateUserDto): Promise<HydratedDocument<User>> {
    const exists = await this.userModel.findOne({
      $or: [{ email: dto.email }, { username: dto.username }],
    }).exec();

    if (exists) {
      throw new ConflictException('Usuario o email ya existe');
    }

    const rounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') || 10);
    const hash = await bcrypt.hash(dto.password, rounds);

    const user = new this.userModel({
      ...dto,
      password: hash,
    });

    return user.save() as Promise<HydratedDocument<User>>;
  }

  async findByUsername(
    username: string,
    options?: { lean?: boolean },
  ): Promise<User | HydratedDocument<User> | null> {
    if (options?.lean) {
      return this.userModel.findOne({ username }).lean<User>().exec();
    }
    return this.userModel.findOne({ username }).exec();
  }

  async findById(
    id: string,
    options?: { lean?: boolean },
  ): Promise<User | HydratedDocument<User> | null> {
    if (options?.lean) {
      return this.userModel.findById(id).lean<User>().exec();
    }
    return this.userModel.findById(id).exec();
  }
}

