import User from "../../../models/User";

export default defineEventHandler(async () => {
    return await User.query().get();
}); 