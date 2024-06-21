import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";
import { Check, Xmark } from "iconoir-react";

interface Props {
  trigger: React.ReactNode;
  prompt?: string;
  onConfirm: () => Promise<void>;
}

export function Confirmation(props: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      showArrow
      backdrop="blur"
    >
      <PopoverTrigger>{props.trigger}</PopoverTrigger>
      <PopoverContent>
        {() => (
          <div className="px-1 py-2 w-full space-y-2">
            <p>{props.prompt || "Are you sure?"}</p>
            <div className="flex space-x-4">
              <Button
                isIconOnly
                color="success"
                onClick={() => props.onConfirm().then(() => setIsOpen(false))}
              >
                <Check />
              </Button>
              <Button
                isIconOnly
                color="danger"
                onClick={() => setIsOpen(false)}
              >
                <Xmark />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
