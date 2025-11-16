import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // bcrypt hash

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: false })
  admin: boolean;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop({ default: '' })
  cellPhone: string;

  @Prop({ default: true })
  mustChangePassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

