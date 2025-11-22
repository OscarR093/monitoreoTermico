import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
   * @param roleOverrides Optional role overrides for admin/superadmin creation
   * @returns The created user document (without password)
   * @throws ConflictException if username or email already exists
   */
  async create(
    dto: CreateUserDto, 
    roleOverrides?: { admin?: boolean; isSuperAdmin?: boolean }
  ): Promise<HydratedDocument<User>> {
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
      admin: roleOverrides?.admin ?? false, // Valor por defecto o sobrescrito
      isSuperAdmin: roleOverrides?.isSuperAdmin ?? false, // Valor por defecto o sobrescrito
      mustChangePassword: true, // Siempre verdadero por defecto para nuevos usuarios
    };

    // Si el email es nulo o vacío, no incluirlo en el documento
    if (!dto.email || dto.email.trim() === '') {
      delete (userData as any).email;
    }

    // Crear el usuario usando el método create del modelo
    const createdUser = await this.userModel.create(userData);
    return createdUser as HydratedDocument<User>;
  }

  /**
   * Finds all users
   * @returns List of users without passwords
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => {
      // Convertir a objeto plano y eliminar la contraseña
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...userWithoutPassword } = userObject;
      return userWithoutPassword as Omit<User, 'password'>;
    });
  }

  /**
   * Finds a user by ID
   * @param id User ID
   * @param options Additional options like lean queries
   * @returns The user document (without password) or null if not found
   */
  async findById(
    id: string,
    options?: { lean?: boolean },
  ): Promise<Omit<User, 'password'> | HydratedDocument<Omit<User, 'password'>> | null> {
    if (options?.lean) {
      const user = await this.userModel.findById(id).lean<User>().exec();
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as Omit<User, 'password'>;
      }
      return null;
    }
    
    const user = await this.userModel.findById(id).exec();
    if (user) {
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...userWithoutPassword } = userObject;
      return userWithoutPassword as HydratedDocument<Omit<User, 'password'>>;
    }
    return null;
  }

  /**
   * Finds a user by username
   * @param username Username to search for
   * @param options Additional options like lean queries
   * @returns The user document or null if not found
   */
  async findByUsername(
    username: string,
    options?: { lean?: boolean },
  ): Promise<User | HydratedDocument<User> | null> {
    if (options?.lean) {
      return this.userModel.findOne({ username }).lean<User>().exec();
    }
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * Updates a user by ID
   * @param id User ID
   * @param dto Data to update
   * @returns The updated user document (without password)
   * @throws NotFoundException if user is not found
   */
  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    // Buscar al usuario existente
    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el nuevo username ya existe (excluyendo al usuario actual)
    if (dto.username && dto.username !== existingUser.username) {
      const usernameExists = await this.userModel.findOne({ 
        username: dto.username, 
        _id: { $ne: id } // Excluir al usuario actual de la búsqueda
      }).exec();
      
      if (usernameExists) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    // Verificar si el nuevo email ya existe (excluyendo al usuario actual)
    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.userModel.findOne({ 
        email: dto.email, 
        _id: { $ne: id } // Excluir al usuario actual de la búsqueda
      }).exec();
      
      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Preparar los datos para actualizar
    const updateData: any = { ...dto };

    // Si se proporciona una nueva contraseña, encriptarla
    if (dto.password) {
      const rounds = this.configService.get('bcrypt.saltRounds');
      updateData.password = await bcrypt.hash(dto.password, rounds);
    }

    // Actualizar el usuario
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Devolver el documento actualizado
    ).exec();

    if (updatedUser) {
      const userObject = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      const { password, ...userWithoutPassword } = userObject;
      return userWithoutPassword as Omit<User, 'password'>;
    }

    return null;
  }

  /**
   * Removes a user by ID
   * @param id User ID
   * @returns Boolean indicating if the user was successfully removed
   * @throws NotFoundException if user is not found
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

