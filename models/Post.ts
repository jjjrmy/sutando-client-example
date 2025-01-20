import { Model } from 'sutando';
import User from './User';

export default class Post extends Model {
  declare id: number;
  declare user_id: number;
  declare title: string;
  declare content: string;
  declare created_at: Date;
  declare updated_at: Date;

  relationAuthor() {
    return this.belongsTo(User, "user_id");
  }
}
