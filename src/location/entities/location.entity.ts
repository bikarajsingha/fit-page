import { ObjectId } from 'mongodb';

export interface LocationEntity {
  _id: ObjectId;
  name: string;
  latitude: number;
  longitude: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
