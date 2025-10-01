import { z } from 'zod';
import ContactMethod from '~/models/ContactMethod';
import { ContactMethodType } from '~/models/ContactMethodType';

const RegisterBodySchema = z.object({
    type: z.enum(Object.values(ContactMethodType)),
    token: z.string(),
    identifier: z.string(),
    platform: z.string(),
    expires_at: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    const user = await requireAuth();

    const body = await readBody(event);

    const validatedData = RegisterBodySchema.parse(body);

    await ContactMethod.query().updateOrCreate(
        {
            user_id: user.id,
            identifier: validatedData.identifier
        },
        {
            type: validatedData.type,
            token: validatedData.token,
            platform: validatedData.platform,
            expires_at: validatedData.expires_at || null,
        }
    );

    return true;
});
