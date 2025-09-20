import User from "../../../models/User";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const body = await readBody(event);
    return await User.query().create({
        name: body.name,
        email: body.email
    });
}); 