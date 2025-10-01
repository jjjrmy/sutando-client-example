import User from "~/models/User";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);

    return await User.query()
        .where('id', id)
        .with('posts')
        .firstOrFail();
});