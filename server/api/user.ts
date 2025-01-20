import User from "~/models/User";

export default defineEventHandler(async () => {
    const user = await User.query().with('posts').first();
    return user;
});
