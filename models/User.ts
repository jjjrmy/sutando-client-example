import { Attribute, Model, compose as withTraits, HasUniqueIds, Collection } from 'sutando';
import { v4 as uuidv4 } from 'uuid';
import Post from './Post';

export default class User extends withTraits(Model, HasUniqueIds) {
  declare id: string;
  declare name: string;
  declare email: string;
  declare emailVerified: boolean;
  declare image: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static UPDATED_AT = "updatedAt";
  static CREATED_AT = "createdAt";

  override connection = 'default';

  override newUniqueId() {
    return uuidv4();
  }

  attributeFullName() {
    return Attribute.make({
      get: (value: string, attributes: any) => attributes.name,
    })
  }

  attributeHasPosts() {
    return Attribute.make({
      get: (value: string, attributes: any) => (this.getRelation('posts') as Collection<Post>)?.isNotEmpty(),
    })
  }

  attributeHasEditedPosts() {
    return Attribute.make({
      get: (value: string, attributes: any) => (this.getRelation('posts') as Collection<Post>)?.filter((post: Post) => post.was_edited).isNotEmpty(),
    })
  }

  relationPosts() {
    return this.hasMany(Post, "user_id");
  }
}
