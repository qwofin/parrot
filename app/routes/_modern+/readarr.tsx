import { db } from "~/db/conn";
import { ReadarrList } from "~/components/readarr/ReadarrList";
import { ReadarrFormModal } from "~/components/readarr/ReadarrFormModal";
import { Button } from "@nextui-org/react";
import { PlusCircle, Refresh } from "iconoir-react";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  return await db.query.readarrSchema.findMany();
}

export default function ReadarrPage() {
  const readarrs = useLoaderData<typeof loader>();

  return (
    <main className="space-y-4">
      <ReadarrList readarrs={readarrs} />
      <div className="flex gap-2">
        <ReadarrFormModal
          trigger={
            <Button color="primary">
              <PlusCircle />
              Add
            </Button>
          }
        />
        <form action="/job/sync/run" method="POST">
          <Button startContent={<Refresh />} type="submit">Sync</Button>
        </form>
      </div>
    </main>
  );
}
