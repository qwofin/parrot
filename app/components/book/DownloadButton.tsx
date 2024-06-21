import { Button } from "@nextui-org/react";
import { Download } from "iconoir-react";

export type Props = {
  filename: string;
  fileId: number;
  format: string;
};

export function DownloadButton(props: Props) {
  const url = `/file/${props.fileId}/download/${props.filename}.${props.format}?format=${props.format}`;
  return (
    <Button as="a" download href={url} startContent={<Download />}>
      {props.format}
    </Button>
  );
}
