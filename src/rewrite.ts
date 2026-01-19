import { Clipboard, getSelectedText, showHUD } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { DeepLError, getPrefs, rewrite, RewriteOptions } from "./deepl";

export async function rewriteText(
  text: string,
  options?: Partial<RewriteOptions>,
) {
  const prefs = getPrefs();
  const targetLang = options?.targetLang ?? prefs.targetLang;
  const writingStyle =
    options?.writingStyle ??
    (prefs.writingStyle as RewriteOptions["writingStyle"]);
  const tone = options?.tone ?? (prefs.tone as RewriteOptions["tone"]);

  return rewrite(text, { targetLang, writingStyle, tone });
}

export default async function Command() {
  let text: string;
  let isSelected = false;
  try {
    text = await getSelectedText();
    isSelected = true;
  } catch {
    text = (await Clipboard.readText()) ?? "";
  }

  if (!text.trim()) {
    await showFailureToast("No text found");
    return;
  }

  try {
    const result = await rewriteText(text);
    if (isSelected) {
      await Clipboard.paste(result);
      await showHUD("Text replaced");
    } else {
      await Clipboard.copy(result);
      await showHUD("Copied to clipboard");
    }
  } catch (e) {
    const title = e instanceof DeepLError ? e.message : "Failed to rewrite";
    await showFailureToast(e, { title });
  }
}
