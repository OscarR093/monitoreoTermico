import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users') // Etiqueta para agrupar en Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
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
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '6739f1e4b8c8d8e8f8a1b2c3' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    if (!result) {
      throw new Error('User not found');
    }
    // Devolver código 204 sin contenido
    return;
  }
}
