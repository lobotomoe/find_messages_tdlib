import * as dotenv from 'dotenv'
import { z } from 'zod';
dotenv.config();

const config = z.object({
    LIBTDJSON_FILE_PATH: z.string(),
    API_ID: z.string().transform((val) => parseInt(val, 10)),
    API_HASH: z.string(),
    TRAVEL_ASK_ALL_CHATS_CHAT_INVITE_LINK: z.string(),
    TARGET_USERNAME: z.string(),
}).parse(process.env);

export default config;