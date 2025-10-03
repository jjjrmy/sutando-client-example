import { z } from 'zod';
import collect from 'collect.js';
import User from "~/models/User";

const UpdateUserSchema = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    username: z.string().optional(),
    biography: z.string().optional(),
    onboarded: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
    const user = await requireAuth();

    const body = await readBody(event);

    const validatedData = UpdateUserSchema.parse(body);

    const updateData = collect({
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        biography: validatedData.biography,
        onboarding_completed_at: validatedData.onboarded ? new Date().toISOString() : undefined,
    });

    try {
        return await User.query()
            .where('id', user.id)
            .update(updateData
                .filter(value => value !== undefined && value !== null && value !== '')
                .all()
            );
    } catch (error) {
        throw createError({
            statusCode: 500
        });
    }
}); 