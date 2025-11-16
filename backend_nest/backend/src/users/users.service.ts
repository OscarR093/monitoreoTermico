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
    // Validar que los campos obligatorios estén presentes
    if (!dto.username || !dto.password) {
      throw new ConflictException('Username and password are required');
    }

    // Construir la condición de búsqueda para evitar duplicados
    const queryConditions: Array<Record<string, any>> = [];
    
    // Siempre verificar el username
    queryConditions.push({ username: dto.username });
    
    // Solo verificar el email si está definido y no es null/undefined
    if (dto.email && dto.email.trim() !== '') {
      queryConditions.push({ email: dto.email });
    }

    const exists = await this.userModel.findOne({
      $or: queryConditions,
    }).exec();

    if (exists) {
      throw new ConflictException('Usuario o email ya existe');
    }

    const rounds = this.configService.get('bcrypt.saltRounds');
    const hash = await bcrypt.hash(dto.password, rounds);

    // Preparar los datos del usuario, asegurando que los campos opcionalmente nulos no se guarden como null
    const userData = {
      ...dto,
      password: hash,
      // Asegurar valores por defecto para campos relacionados con roles
      admin: false, // Siempre falso por defecto
      isSuperAdmin: false, // Siempre falso por defecto
      mustChangePassword: true, // Siempre verdadero por defecto
    };

    // Si el email es nulo o vacío, no incluirlo en el documento
    if (!dto.email || dto.email.trim() === '') {
      delete userData.email;
    }

    const user = new this.userModel(userData);

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

