import {
  Clipboard,
  getSelectedText,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import {
  DeepLError,
  getLanguageName,
  getPrefs,
  translate,
  TranslateOptions,
} from "./deepl";

export async function translateText(
  text: string,
  options?: Partial<TranslateOptions>,
) {
  const prefs = getPrefs();
  const targetLang = options?.targetLang ?? prefs.translateTargetLang;
  const formality =
    options?.formality ?? (prefs.formality as TranslateOptions["formality"]);
  const modelType =
    options?.modelType ??
    ((prefs.defaultModelType as TranslateOptions["modelType"]) || undefined);
  const preserveFormatting =
    options?.preserveFormatting ?? prefs.preserveFormatting;
  const showBilledCharacters = prefs.showBilledCharacters;

  return translate(text, {
    ...options,
    targetLang,
    formality,
    modelType,
    preserveFormatting,
    showBilledCharacters,
  });
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
    const result = await translateText(text);
    const detectedLang = getLanguageName(result.detectedSourceLanguage);
    const billedMsg = result.billedCharacters
      ? ` (${result.billedCharacters} chars)`
      : "";

    if (isSelected) {
      await Clipboard.paste(result.text);
      await showToast({
        style: Toast.Style.Success,
        title: "Text translated",
        message: `From ${detectedLang}${billedMsg}`,
      });
    } else {
      await Clipboard.copy(result.text);
      await showHUD(`Copied to clipboard • From ${detectedLang}${billedMsg}`);
    }
  } catch (e) {
    const title = e instanceof DeepLError ? e.message : "Failed to translate";
    await showFailureToast(e, { title });
  }
}
