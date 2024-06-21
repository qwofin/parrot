import { Button } from "@nextui-org/react";
import { Download } from "iconoir-react";

export type Props = {
  filename: string;
  fileId: number;
  format: string;
};

export function SimpleDownloadButton(props: Props) {
  const url = `/simple/file/${props.fileId}/convert?filename=${props.filename}&format=${props.format}`;
  return (
    <Button as="a" href={url} startContent={<Download />}>
      {props.format}
    </Button>
  );
}
