import { db } from "~/db/conn";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { readarrSchema } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function action({
  params,
  request,
}: ActionFunctionArgs) {
  const id = Number(params.id)

  if (request.method === "DELETE") {
    await db.delete(readarrSchema).where(eq(readarrSchema.id, id));
  }

  redirect('/readarr')
}