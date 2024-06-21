import { Input } from "@nextui-org/react";
import { Controller } from "react-hook-form";

type Props = {
  name: string;
  control: any;
  rules?: any;
  inputProps: any;
};

export function ControlledInput(props: Props) {
  return (
    <Controller
      name={props.name}
      control={props.control}
      rules={props.rules}
      render={({ field }) => <Input {...props.inputProps} {...field} />}
    />
  );
}
