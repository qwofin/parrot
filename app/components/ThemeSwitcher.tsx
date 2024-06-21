import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ColorPicker, Computer, HalfMoon, SunLight } from "iconoir-react";
import {Tooltip} from "@nextui-org/react";
import clsx from "clsx";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ColorPicker />;
  }

  const options = {
    dark: {
      icon: HalfMoon,
      theme: "dark",
      next: "light",
      translate: "translate-y-1/3",
    },
    light: { icon: SunLight, theme: "light", next: "system", translate: "" },
    system: {
      icon: Computer,
      theme: "system",
      next: "dark",
      translate: "-translate-y-1/3",
    },
  };

  return (
    <div className={clsx("flex-col transition ease-in-out", options[theme as keyof typeof options].translate)}>
      {Object.values(options).map((item) => (
        <Tooltip key={item.theme} content={`Switch to ${item.next} theme.`}>
          <item.icon
            onClick={() => setTheme(item.next)}
            className={clsx("cursor-pointer", { invisible: theme != item.theme })}
          />
        </Tooltip>
      ))}
    </div>
  );
};
