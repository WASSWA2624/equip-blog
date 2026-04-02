import { parseSharedEnv } from "@/lib/env/runtime";

export const sharedEnv = parseSharedEnv(process.env);
