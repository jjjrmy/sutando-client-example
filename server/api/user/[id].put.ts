import { z } from 'zod';
import User from "~/models/User";

const UpdateUserSchema = z.object({
    name: z.string(),
    email: z.email()
});

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const body = await readBody(event);

    const validatedData = UpdateUserSchema.parse(body);

    try {
        return await User.query()
            .where('id', id)
            .update({
                name: validatedData.name,
                email: validatedData.email
            });
    } catch (error) {
        throw createError({
            statusCode: 500
        });
    }
}); 