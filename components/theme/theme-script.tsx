import { THEME_BOOTSTRAP } from "./theme";

/** Inline bootstrap so the document class is set before React hydrates. */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }}
    />
  );
}
