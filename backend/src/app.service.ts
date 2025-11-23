import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.createSuperUserOnStartup();
  }

  private async createSuperUserOnStartup() {
    try {
      // Contar usuarios existentes
      const allUsers = await this.usersService.findAll();
      if (allUsers.length > 0) {
        console.log('La base de datos ya tiene usuarios. No se creará el super usuario.');
        return;
      }

      // Obtener las credenciales del super usuario desde variables de entorno
      const superUserConfig = this.configService.get('superUser');
      const { username, password } = superUserConfig;

      if (!username || !password) {
        console.log('Variables de entorno para super usuario no definidas. Omitiendo creación.');
        return;
      }

      console.log('No se encontraron usuarios. Creando super usuario...');
      
      // Crear el super usuario
      await this.usersService.create({
        username,
        password,
        email: superUserConfig.email,
        fullName: superUserConfig.fullName,
        cellPhone: superUserConfig.phone,
      }, {
        admin: true,
        isSuperAdmin: true,
      });

      console.log('✅ ¡Super usuario creado exitosamente!');
    } catch (error) {
      console.error('❌ Error al crear el super usuario:', error.message);
    }
  }
}
