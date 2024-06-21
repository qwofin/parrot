import { db } from "~/db/conn";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Readarr } from "~/services/Readarr";
import { readarrSchema } from "~/db/schema";

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();

  const readarr = new Readarr(data);
  try {
    await readarr.validate();
    await db.insert(readarrSchema).values(data);
  } catch (err) {
    return json({
      success: false,
      errors: {
        root: {
          message: (err as Error).message,
        },
      },
    });
  }

  return json({ success: true });
}
