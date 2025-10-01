import { z } from 'zod';
import User from "~/models/User";

const UpdateUserSchema = z.object({
    name: z.string(),
    email: z.email()
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { id } = getRouterParams(event);

    const validatedData = UpdateUserSchema.parse(body);

    await User.query()
        .where('id', id)
        .update({
            name: validatedData.name,
            email: validatedData.email
        });

    return await User.query().where('id', id).first();
}); 