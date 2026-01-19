import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  getSelectedText,
  popToRoot,
  showToast,
  Toast,
} from "@raycast/api";
import { FormValidation, showFailureToast, useForm } from "@raycast/utils";
import { useEffect, useRef } from "react";
import {
  DeepLError,
  getPrefs,
  rewrite,
  RewriteOptions,
  Tone,
  WritingStyle,
} from "./deepl";

const LANGUAGES = [
  { title: "English (US)", value: "en-US" },
  { title: "English (UK)", value: "en-GB" },
  { title: "German", value: "de" },
  { title: "Spanish", value: "es" },
  { title: "French", value: "fr" },
  { title: "Italian", value: "it" },
  { title: "Portuguese (BR)", value: "pt-BR" },
  { title: "Portuguese (PT)", value: "pt-PT" },
];

const STYLES: { title: string; value: string; strict: string }[] = [
  { title: "Default", value: "default", strict: "default" },
  { title: "Academic", value: "prefer_academic", strict: "academic" },
  { title: "Business", value: "prefer_business", strict: "business" },
  { title: "Casual", value: "prefer_casual", strict: "casual" },
  { title: "Simple", value: "prefer_simple", strict: "simple" },
];

const TONES: { title: string; value: string; strict: string }[] = [
  { title: "Default", value: "default", strict: "default" },
  { title: "Confident", value: "prefer_confident", strict: "confident" },
  { title: "Diplomatic", value: "prefer_diplomatic", strict: "diplomatic" },
  {
    title: "Enthusiastic",
    value: "prefer_enthusiastic",
    strict: "enthusiastic",
  },
  { title: "Friendly", value: "prefer_friendly", strict: "friendly" },
];

interface FormValues {
  text: string;
  targetLang: string;
  writingStyle: string;
  tone: string;
  strictMode: boolean;
}

export default function Command() {
  const prefs = getPrefs();
  const isSelected = useRef(false);

  const { handleSubmit, itemProps, setValue } = useForm<FormValues>({
    initialValues: {
      text: "",
      targetLang: prefs.targetLang,
      writingStyle: prefs.writingStyle,
      tone: prefs.tone,
      strictMode: false,
    },
    validation: { text: FormValidation.Required },
    async onSubmit(values) {
      try {
        const style = STYLES.find((s) => s.value === values.writingStyle);
        const tone = TONES.find((t) => t.value === values.tone);
        const opts: RewriteOptions = {
          targetLang: values.targetLang,
          writingStyle: (values.strictMode && style
            ? style.strict
            : values.writingStyle) as WritingStyle,
          tone: (values.strictMode && tone ? tone.strict : values.tone) as Tone,
        };

        const result = await rewrite(values.text, opts);
        if (isSelected.current) {
          await Clipboard.paste(result);
          await showToast({
            style: Toast.Style.Success,
            title: "Text replaced",
          });
        } else {
          await Clipboard.copy(result);
          await showToast({
            style: Toast.Style.Success,
            title: "Copied to clipboard",
          });
        }
        await popToRoot();
      } catch (e) {
        const title = e instanceof DeepLError ? e.message : "Failed to rewrite";
        await showFailureToast(e, { title });
      }
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const selected = await getSelectedText();
        setValue("text", selected);
        isSelected.current = true;
      } catch {
        const clipboard = await Clipboard.readText();
        setValue("text", clipboard ?? "");
      }
    })();
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Rewrite" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Text" {...itemProps.text} />
      <Form.Dropdown title="Language" {...itemProps.targetLang}>
        {LANGUAGES.map((l) => (
          <Form.Dropdown.Item key={l.value} {...l} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Style" {...itemProps.writingStyle}>
        {STYLES.map((s) => (
          <Form.Dropdown.Item key={s.value} title={s.title} value={s.value} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Tone" {...itemProps.tone}>
        {TONES.map((t) => (
          <Form.Dropdown.Item key={t.value} title={t.title} value={t.value} />
        ))}
      </Form.Dropdown>
      <Form.Checkbox
        label="Strict Mode"
        info="Use strict style/tone (no fallback to similar styles)"
        {...itemProps.strictMode}
      />
    </Form>
  );
}
