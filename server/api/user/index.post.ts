import User from "../../../models/User";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    return await User.query().create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email
    });
}); 