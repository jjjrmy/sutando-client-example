import { Model } from 'sutando';
import User from './User';
import { ContactMethodType } from './ContactMethodType';

export default class ContactMethod extends Model {
    declare id: number;
    declare user_id: string;
    declare type: ContactMethodType;
    declare token: string;
    declare identifier: string;
    declare platform: string;
    declare expires_at: Date | null;
    declare last_contacted_at: Date | null;
    declare created_at: Date;
    declare updated_at: Date;

    relationUser() {
        return this.belongsTo(User, "user_id");
    }
}
