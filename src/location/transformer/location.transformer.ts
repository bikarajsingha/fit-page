import { LocationEntity } from '../entities/location.entity';
import { Location } from '../intefaces/location.interface';

export class LocationTransformer {
  async tranformEntityToInterface(
    locationEntity: LocationEntity,
  ): Promise<Location> {
    const location: Location = {
      id: locationEntity._id.toString(),
      name: locationEntity.name,
      latitude: locationEntity.latitude,
      longitude: locationEntity.longitude,
    };

    return location;
  }
}
