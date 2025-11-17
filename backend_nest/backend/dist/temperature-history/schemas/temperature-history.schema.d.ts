import { Document } from 'mongoose';
export type TemperatureHistoryDocument = TemperatureHistory & Document;
export declare class TemperatureHistory {
    timestamp: Date;
    temperatura: number;
    equipo: string;
}
export declare const TemperatureHistorySchema: import("mongoose").Schema<TemperatureHistory, import("mongoose").Model<TemperatureHistory, any, any, any, Document<unknown, any, TemperatureHistory, any, {}> & TemperatureHistory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TemperatureHistory, Document<unknown, {}, import("mongoose").FlatRecord<TemperatureHistory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TemperatureHistory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
