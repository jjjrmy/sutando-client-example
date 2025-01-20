import { Attribute, Collection, Model } from 'sutando';
import Post from './Post';

export default class User extends Model {
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare created_at: Date;
  declare updated_at: Date;

  attributeFullName() {
    return Attribute.make({
      get: (value: string, attributes: any) => `${attributes.first_name} ${attributes.last_name}`,
    })
  }

  attributeHasPosts() {
    return Attribute.make({
      get: (value: string, attributes: any) => (this.getRelation('posts') as Collection<Post>)?.isNotEmpty(),
    })
  }

  relationPosts()
  {
    return this.hasMany(Post, "user_id");
  }
}
