import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // bcrypt hash

  @Prop({ required: false, unique: true, sparse: true }) // sparse: true permite múltiples valores null
  email?: string;

  @Prop({ required: false }) // Ahora no es requerido
  fullName?: string;

  @Prop({ default: false })
  admin: boolean;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop({ default: '' })
  cellPhone?: string;

  @Prop({ default: true })
  mustChangePassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

