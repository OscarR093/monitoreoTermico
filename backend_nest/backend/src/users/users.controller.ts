import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('users') // Etiqueta para agrupar en Swagger
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'newuser',
        email: 'newuser@example.com',
        fullName: 'New User',
        cellPhone: '+1234567890',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
        createdAt: '2025-11-15T10:00:00.000Z',
        updatedAt: '2025-11-15T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - Admin required' })
  @ApiResponse({ status: 400, description: 'Bad request - Missing required fields' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  @UseGuards(RolesGuard) // Solo administradores pueden crear usuarios
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Verificar que el usuario sea administrador
    if (!req.user || !req.user.admin) {
      throw new Error('Acceso denegado. Se requiere rol de administrador.');
    }

    // 1. El admin solo envía el nombre de usuario y una contraseña temporal.
    const { username, password } = createUserDto;

    // Verificación básica de que los datos mínimos están presentes
    if (!username || !password) {
      throw new Error('Se requiere nombre de usuario y contraseña.');
    }

    // 2. Llenamos los campos requeridos por el modelo con datos de ejemplo (placeholders).
    //    El email debe ser único, por lo que lo basamos en el username si no se proporciona.
    const placeholderData = {
      fullName: createUserDto.fullName || 'Usuario Pendiente de Actualización',
      email: createUserDto.email || `${username.toLowerCase()} @example.local`,
      cellPhone: createUserDto.cellPhone || '0000000000'
    };

    // 3. Creamos el usuario en la base de datos con la información completa
    return this.usersService.create({
      username,
      password,
      email: placeholderData.email,
      fullName: placeholderData.fullName,
      cellPhone: placeholderData.cellPhone,
    }, {
      admin: false, // Los usuarios creados por admin no son admin por defecto
      isSuperAdmin: false, // Los usuarios normales no son superadmin
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: [
        {
          _id: '6739f1e4b8c8d8e8f8a1b2c3',
          username: 'user1',
          email: 'user1@example.com',
          fullName: 'User One',
          cellPhone: '+1234567890',
          admin: false,
          isSuperAdmin: false,
          mustChangePassword: true,
          createdAt: '2025-11-15T10:00:00.000Z',
          updatedAt: '2025-11-15T10:00:00.000Z'
        },
        {
          _id: '6739f1e4b8c8d8e8f8a1b2c4',
          username: 'user2',
          email: 'user2@example.com',
          fullName: 'User Two',
          cellPhone: '+0987654321',
          admin: true,
          isSuperAdmin: false,
          mustChangePassword: false,
          createdAt: '2025-11-15T10:05:00.000Z',
          updatedAt: '2025-11-15T10:05:00.000Z'
        }
      ]
    }
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '6739f1e4b8c8d8e8f8a1b2c3' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      example: {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'user1',
        email: 'user1@example.com',
        fullName: 'User One',
        cellPhone: '+1234567890',
        admin: false,
        isSuperAdmin: false,
        mustChangePassword: true,
        createdAt: '2025-11-15T10:00:00.000Z',
        updatedAt: '2025-11-15T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '6739f1e4b8c8d8e8f8a1b2c3' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        _id: '6739f1e4b8c8d8e8f8a1b2c3',
        username: 'updateduser',
        email: 'updateduser@example.com',
        fullName: 'Updated User',
        cellPhone: '+1111111111',
        admin: true,
        isSuperAdmin: false,
        mustChangePassword: false,
        createdAt: '2025-11-15T10:00:00.000Z',
        updatedAt: '2025-11-16T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Verificar si el usuario intenta actualizarse a sí mismo o si es admin
    // req.user ahora es el documento completo de mongoose, por lo que usamos _id
    if (req.user._id.toString() !== id && !req.user.admin) {
      throw new Error('Acceso denegado');
    }

    // Si hay una contraseña nueva, forzamos mustChangePassword a false
    if (updateUserDto.password) {
      updateUserDto.mustChangePassword = false;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id') // Método separado explícitamente para PUT
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID (Legacy PUT)' })
  async updateLegacy(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.update(id, updateUserDto, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Cambiado de NO_CONTENT a OK para devolver mensaje
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '6739f1e4b8c8d8e8f8a1b2c3' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete super user or insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Request() req) {
    const userIdToDelete = id;
    const requestingUser = req.user; // El usuario que hace la petición

    // 1. Obtenemos el usuario que se va a eliminar ANTES de cualquier otra lógica.
    const userToDelete = await this.usersService.findById(userIdToDelete);
    if (!userToDelete) {
      throw new Error('User not found');
    }

    // --- ✅ NUEVA REGLA DE SEGURIDAD ---
    // 2. Nadie, ni siquiera él mismo, puede eliminar al Super Usuario.
    if (userToDelete.isSuperAdmin) {
      throw new Error('El Super Usuario no puede ser eliminado.');
    }

    // 3. Caso de auto-eliminación (ahora es seguro porque ya sabemos que no es el Super Admin).
    // Usamos _id.toString() para comparar
    if (requestingUser._id.toString() === userIdToDelete) {
      await this.usersService.remove(userIdToDelete);
      return { message: 'Tu cuenta ha sido eliminada correctamente.' };
    }

    // 4. Lógica para que un admin/super-admin elimine a OTRO usuario.

    // 4.1. Si el objetivo es un admin (pero no super-admin)...
    if (userToDelete.admin) {
      // ...solo un superusuario puede eliminarlo.
      if (!requestingUser.isSuperAdmin) {
        throw new Error('Acceso denegado. Solo un superusuario puede eliminar a otro administrador.');
      }
      await this.usersService.remove(userIdToDelete);
      return { message: 'Administrador eliminado correctamente.' };
    }

    // 4.2. Si el objetivo es un usuario normal...
    if (!requestingUser.admin) {
      throw new Error('Acceso denegado. Se requiere rol de administrador para eliminar a otros usuarios.');
    }

    await this.usersService.remove(userIdToDelete);
    return { message: 'Usuario eliminado correctamente.' };
  }
}
