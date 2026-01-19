import {
  Action,
  ActionPanel,
  Form,
  popToRoot,
  showToast,
  Toast,
} from "@raycast/api";
import { FormValidation, showFailureToast, useForm } from "@raycast/utils";
import { createGlossary, DeepLError } from "./deepl";

const LANGUAGES = [
  { title: "Bulgarian", value: "bg" },
  { title: "Czech", value: "cs" },
  { title: "Danish", value: "da" },
  { title: "German", value: "de" },
  { title: "Greek", value: "el" },
  { title: "English", value: "en" },
  { title: "Spanish", value: "es" },
  { title: "Estonian", value: "et" },
  { title: "Finnish", value: "fi" },
  { title: "French", value: "fr" },
  { title: "Hungarian", value: "hu" },
  { title: "Indonesian", value: "id" },
  { title: "Italian", value: "it" },
  { title: "Japanese", value: "ja" },
  { title: "Korean", value: "ko" },
  { title: "Lithuanian", value: "lt" },
  { title: "Latvian", value: "lv" },
  { title: "Norwegian", value: "nb" },
  { title: "Dutch", value: "nl" },
  { title: "Polish", value: "pl" },
  { title: "Portuguese", value: "pt" },
  { title: "Romanian", value: "ro" },
  { title: "Russian", value: "ru" },
  { title: "Slovak", value: "sk" },
  { title: "Slovenian", value: "sl" },
  { title: "Swedish", value: "sv" },
  { title: "Turkish", value: "tr" },
  { title: "Ukrainian", value: "uk" },
  { title: "Chinese", value: "zh" },
];

interface FormValues {
  name: string;
  sourceLang: string;
  targetLang: string;
  entries: string;
}

export default function Command() {
  const { handleSubmit, itemProps } = useForm<FormValues>({
    initialValues: {
      name: "",
      sourceLang: "en",
      targetLang: "de",
      entries: "",
    },
    validation: {
      name: FormValidation.Required,
      entries: (value) => {
        if (!value?.trim()) return "Entries required";
        const lines = value.trim().split("\n").filter(Boolean);
        for (const line of lines) {
          if (!line.includes("\t"))
            return "Each line must have source<TAB>target format";
        }
        return undefined;
      },
    },
    async onSubmit(values) {
      try {
        await createGlossary(
          values.name,
          values.sourceLang,
          values.targetLang,
          values.entries.trim(),
        );
        await showToast({
          style: Toast.Style.Success,
          title: "Glossary created",
        });
        await popToRoot();
      } catch (e) {
        const title =
          e instanceof DeepLError ? e.message : "Failed to create glossary";
        await showFailureToast(e, { title });
      }
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Glossary" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Name"
        placeholder="My Glossary"
        {...itemProps.name}
      />
      <Form.Dropdown title="Source Language" {...itemProps.sourceLang}>
        {LANGUAGES.map((l) => (
          <Form.Dropdown.Item key={l.value} {...l} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Target Language" {...itemProps.targetLang}>
        {LANGUAGES.map((l) => (
          <Form.Dropdown.Item key={l.value} {...l} />
        ))}
      </Form.Dropdown>
      <Form.TextArea
        title="Entries (TSV)"
        placeholder={"source1\ttarget1\nsource2\ttarget2"}
        info="One entry per line, source and target separated by TAB"
        {...itemProps.entries}
      />
    </Form>
  );
}
