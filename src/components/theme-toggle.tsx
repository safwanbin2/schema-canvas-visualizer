
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Toggle 
      pressed={theme === "dark"}
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="h-9 w-9 p-0 flex items-center justify-center"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Toggle>
  );
}
