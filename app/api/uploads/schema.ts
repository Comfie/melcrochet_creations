import { z } from "zod";
import { UPLOAD_FOLDER } from "@/lib/upload-folder";

export const discardSchema = z.object({
  publicIds: z
    .array(z.string().startsWith(`${UPLOAD_FOLDER}/`, "Only admin uploads can be discarded"))
    .min(1)
    .max(20),
});
