import config from "./config";
import { Client } from 'tdl'
import { TDLib } from 'tdl-tdlib-addon'

const client = new Client(new TDLib(
    config.LIBTDJSON_FILE_PATH,
), {
    apiId: config.API_ID,
    apiHash: config.API_HASH,
});

export default client;