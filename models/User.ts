import { Attribute, Model, compose as withTraits, HasUniqueIds, Collection } from 'sutando';
import { v4 as uuidv4 } from 'uuid';
import Post from './Post';
import ContactMethod from './ContactMethod';

export default class User extends withTraits(Model, HasUniqueIds) {
  declare id: string;
  declare name: string;
  declare username: string | null;
  declare biography: string | null;
  declare email: string;
  declare emailVerified: boolean;
  declare phoneNumber: string | null;
  declare phoneNumberVerified: boolean;
  declare stripeCustomerId: Date | null;
  declare image: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare onboarding_completed_at: Date | null;

  declare avatar: string | null;
  declare full_name: string | null;
  declare was_onboarded: boolean;

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

  attributeAvatar() {
    return Attribute.make({
      get: (value: string, attributes: User) => `https://www.gravatar.com/avatar/${attributes.id}`,
    })
  }

  attributeUsername() {
    return Attribute.make({
      get: (value: string, attributes: any) => value || attributes.email?.split('@')[0],
    })
  }

  attributeWasOnboarded() {
    return Attribute.make({
      get: (value: string, attributes: any) => !!attributes.onboarding_completed_at,
    })
  }

  attributeHasPosts() {
    return Attribute.make({
      get: (value: string, attributes: any) => true // (this.getRelation('posts') as Collection<Post>)?.isNotEmpty(),
    })
  }

  attributeHasEditedPosts() {
    return Attribute.make({
      get: (value: string, attributes: any) => true // (this.getRelation('posts') as Collection<Post>)?.filter((post: Post) => post.was_edited).isNotEmpty(),
    })
  }

  relationPosts() {
    return this.hasMany(Post, "user_id");
  }

  relationContactMethods() {
    return this.hasMany(ContactMethod, "user_id");
  }
}
