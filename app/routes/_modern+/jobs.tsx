import { Button } from "@nextui-org/react";
import { useLoaderData } from "@remix-run/react";
import { Play } from "iconoir-react";
import { scheduler } from "~/services/Scheduler";

export async function loader() {
  return scheduler.listJobs();
}

export default function ReadarrPage() {
  const jobs = useLoaderData<typeof loader>();

  return (
    <main className="space-y-4">
      {jobs.map((item) => (
        <div key={item.id}>
          {item.id} - {item.nextRunAt} - {item.lastRunAt} -{" "}
          {item.running.toString()} -{" "}
          <form action={`/job/${item.id}/run`} method="POST">
            <Button isIconOnly type="submit">
              <Play />
            </Button>
          </form>
        </div>
      ))}
    </main>
  );
}
