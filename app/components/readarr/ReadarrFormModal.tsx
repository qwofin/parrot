import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Plus, TrashSolid, Xmark } from "iconoir-react";
import { ControlledInput } from "../ControlledInput";
import { Confirmation } from "../Confirmation";
import type { readarrSchema } from "~/db/schema";
import { useNavigate } from "@remix-run/react";

export type Props = {
  id?: number;
  data?: typeof readarrSchema.$inferInsert;
  trigger: React.ReactElement;
};

export function ReadarrFormModal(props: Props) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<typeof readarrSchema.$inferInsert>({
    defaultValues: props.data,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dirMaps",
  });

  async function onSubmit(data: typeof readarrSchema.$inferInsert) {
    let url = `/api/readarr`;
    if (props.id) {
      url = url + "/" + props.id;
    }
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      onClose();
      navigate("/readarr");
    } else if (result.errors) {
      for (const [key, value] of Object.entries(result.errors)) {
        setError(key as any, value as any);
      }
    }
  }

  async function onDelete(id: number) {
    await fetch(`/api/readarr/${id}`, { method: "DELETE" });
    navigate("/readarr");
  }

  const deleteButton =
    props.id !== undefined ? (
      <Confirmation
        onConfirm={async () => await onDelete(props.id as number)}
        trigger={
          <Button color="danger">
            <TrashSolid /> Delete
          </Button>
        }
      />
    ) : null;
  return (
    <>
      {React.cloneElement(props.trigger, { onPress: onOpen })}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit((data) => onSubmit(data))}>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                <p aria-live="polite">{errors?.root?.message}</p>
                <div className="space-y-2">
                  <ControlledInput
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    inputProps={{
                      type: "text",
                      label: "Name",
                      isRequired: true,
                    }}
                  />
                  <ControlledInput
                    name="host"
                    control={control}
                    rules={{ required: true }}
                    inputProps={{
                      type: "text",
                      label: "Host",
                      isRequired: true,
                    }}
                  />
                  <ControlledInput
                    name="publicHost"
                    control={control}
                    inputProps={{
                      type: "text",
                      label: "Public host - the url users can reach readarr directly (for serving cover images)",
                    }}
                  />
                  <ControlledInput
                    name="apiKey"
                    control={control}
                    rules={{ required: true }}
                    inputProps={{
                      type: "text",
                      label: "API key",
                      isRequired: true,
                    }}
                  />

                  <div className="items-center space-y-2">
                    <div className="grid grid-cols-2 items-center">
                      <p>Remote directory mappings</p>
                      <Button
                        className="justify-self-end"
                        isIconOnly
                        onClick={() => append({ local: "", remote: "" })}
                      >
                        <Plus />
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-7 gap-2 items-center"
                      >
                        <ControlledInput
                          name={`dirMaps.${index}.remote`}
                          control={control}
                          rules={{ required: true }}
                          inputProps={{
                            type: "text",
                            label: "Remote",
                            className: "col-span-3",
                            isRequired: true,
                          }}
                        />
                        <ControlledInput
                          name={`dirMaps.${index}.local`}
                          control={control}
                          rules={{ required: true }}
                          inputProps={{
                            type: "text",
                            label: "Local",
                            className: "col-span-3",
                            isRequired: true,
                          }}
                        />

                        <Button
                          isIconOnly
                          onClick={() => remove(index)}
                          className="justify-self-end"
                        >
                          <Xmark />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                {deleteButton}
                <Button color="danger" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
