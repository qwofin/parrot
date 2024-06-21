import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { scheduler } from "~/services/Scheduler";

export async function action({
  params,
}: ActionFunctionArgs) {
  const id = params.id
  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    }); 
  }
  const job = scheduler.getJob(id)
  if (! job) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    }); 
  }
  job.execute()
  return redirect('/jobs');
}