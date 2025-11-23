import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemperatureHistoryDocument = TemperatureHistory & Document;

@Schema({ 
  timestamps: true, // Esto agrega createdAt y updatedAt automáticamente
})
export class TemperatureHistory {
  @Prop({ 
    required: true
  })
  timestamp: Date;

  @Prop({ required: true })
  temperatura: number;

  @Prop({ required: true })
  equipo: string;
}

export const TemperatureHistorySchema = SchemaFactory.createForClass(TemperatureHistory);

// Aplicar el índice TTL para expiración automática después de crear el esquema
// Este índice hará que los documentos expiren 30 días después del timestamp
TemperatureHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 días en segundos