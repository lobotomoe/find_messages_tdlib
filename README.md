# Usage

1. Clone and build tdlib for your platform: https://github.com/tdlib/td
2. Register Tg app in https://my.telegram.org/apps
3. Fill LIBTDJSON_FILE_PATH in .env. `dylib` for mac, `dll` for windows, `so` file for linux
4. Fill rest in .env (see .env.example)
5. `pnpm i`
6. `pnpm run build`
7. `pnpm run start`
