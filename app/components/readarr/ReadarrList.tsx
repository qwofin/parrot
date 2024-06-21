import { Button } from "@nextui-org/react";
// import { Confirmation } from "../Confirmation";
// import { TrashSolid, RefreshDouble, PlusCircle, Edit } from "iconoir-react";
// import { deleteReadarr, triggerSync } from "~/app/(modern)/readarr/actions";
import { ReadarrFormModal } from "./ReadarrFormModal";
import type { readarrSchema } from "~/db/schema";
import { Edit } from "iconoir-react";
export type Props = {
  readarrs: (typeof readarrSchema.$inferSelect)[];
};
export function ReadarrList(props: Props) {
  return (
    <ul className="list-none space-y-4">
      <li className="grid grid-cols-3 font-bold">
        <div>Name</div>
        <div>Host</div>
      </li>
      {props.readarrs.map((item) => (
        <li key={item.id} className="grid grid-cols-3">
          <div>{item.name}</div>
          <div>{item.host}</div>
          <div className="space-x-1">
            <ReadarrFormModal
              id={item.id}
              data={item}
              trigger={
                <Button isIconOnly>
                  <Edit />
                </Button>
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
