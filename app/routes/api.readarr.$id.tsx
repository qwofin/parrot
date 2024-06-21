import { db } from "~/db/conn";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Readarr } from "~/services/Readarr";
import { readarrSchema } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function action({
  params,
  request,
}: ActionFunctionArgs) {
  const id = Number(params.id)

  if (request.method === "POST") {
    const data = await request.json();
  
    const readarr = new Readarr(data);
    try {
      await readarr.validate();
      await db.update(readarrSchema).set(data).where(eq(readarrSchema.id, id));
    } catch (err) {
      console.log(err, data)
      return json({
        success: false,
        errors: {
          root: {
            message: (err as Error).message,
          },
        },
      });
    }
  } else if (request.method === "DELETE") {
    await db.delete(readarrSchema).where(eq(readarrSchema.id, id));
  }
  return json({ success: true });
}