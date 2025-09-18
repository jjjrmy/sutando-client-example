import User from "../../../models/User";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    return await User.query().create({
        name: body.name,
        email: body.email
    });
}); 