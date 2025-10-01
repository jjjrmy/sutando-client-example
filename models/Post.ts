import { Attribute, Model } from 'sutando';
import User from './User';

export default class Post extends Model {
  declare id: number;
  declare user_id: number;
  declare title: string | null;
  declare content: string;
  declare photo: string | null;
  declare created_at: Date;
  declare updated_at: Date;

  declare photo_url: string | null;
  declare was_edited: boolean;

  attributeWasEdited() {
    return Attribute.make({
      get: (value: string, attributes: any) => attributes.updated_at !== attributes.created_at,
    })
  }

  attributePhotoUrl() {
    return Attribute.make({
      get: (value: string, attributes: any) => {
        const config = useRuntimeConfig();
        return `${config.public.cdnUrl}/${attributes.photo}`;
      },
    })
  }

  relationUser() {
    return this.belongsTo(User);
  }
}
