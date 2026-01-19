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
import {
  FormValidation,
  showFailureToast,
  useForm,
  useCachedPromise,
} from "@raycast/utils";
import { useEffect, useRef, useState } from "react";
import {
  DeepLError,
  getLanguageName,
  getPrefs,
  Glossary,
  listGlossaries,
  ModelType,
  SplitSentences,
  TagHandling,
  TranslateOptions,
} from "./deepl";
import { translateText } from "./translate";

const TARGET_LANGUAGES = [
  { title: "Bulgarian", value: "BG" },
  { title: "Czech", value: "CS" },
  { title: "Danish", value: "DA" },
  { title: "German", value: "DE" },
  { title: "Greek", value: "EL" },
  { title: "English (UK)", value: "EN-GB" },
  { title: "English (US)", value: "EN-US" },
  { title: "Spanish", value: "ES" },
  { title: "Estonian", value: "ET" },
  { title: "Finnish", value: "FI" },
  { title: "French", value: "FR" },
  { title: "Hungarian", value: "HU" },
  { title: "Indonesian", value: "ID" },
  { title: "Italian", value: "IT" },
  { title: "Japanese", value: "JA" },
  { title: "Korean", value: "KO" },
  { title: "Lithuanian", value: "LT" },
  { title: "Latvian", value: "LV" },
  { title: "Norwegian", value: "NB" },
  { title: "Dutch", value: "NL" },
  { title: "Polish", value: "PL" },
  { title: "Portuguese (BR)", value: "PT-BR" },
  { title: "Portuguese (PT)", value: "PT-PT" },
  { title: "Romanian", value: "RO" },
  { title: "Russian", value: "RU" },
  { title: "Slovak", value: "SK" },
  { title: "Slovenian", value: "SL" },
  { title: "Swedish", value: "SV" },
  { title: "Turkish", value: "TR" },
  { title: "Ukrainian", value: "UK" },
  { title: "Chinese (Simplified)", value: "ZH-HANS" },
  { title: "Chinese (Traditional)", value: "ZH-HANT" },
];

const SOURCE_LANGUAGES = [
  { title: "Auto-detect", value: "" },
  { title: "Bulgarian", value: "BG" },
  { title: "Czech", value: "CS" },
  { title: "Danish", value: "DA" },
  { title: "German", value: "DE" },
  { title: "Greek", value: "EL" },
  { title: "English", value: "EN" },
  { title: "Spanish", value: "ES" },
  { title: "Estonian", value: "ET" },
  { title: "Finnish", value: "FI" },
  { title: "French", value: "FR" },
  { title: "Hungarian", value: "HU" },
  { title: "Indonesian", value: "ID" },
  { title: "Italian", value: "IT" },
  { title: "Japanese", value: "JA" },
  { title: "Korean", value: "KO" },
  { title: "Lithuanian", value: "LT" },
  { title: "Latvian", value: "LV" },
  { title: "Norwegian", value: "NB" },
  { title: "Dutch", value: "NL" },
  { title: "Polish", value: "PL" },
  { title: "Portuguese", value: "PT" },
  { title: "Romanian", value: "RO" },
  { title: "Russian", value: "RU" },
  { title: "Slovak", value: "SK" },
  { title: "Slovenian", value: "SL" },
  { title: "Swedish", value: "SV" },
  { title: "Turkish", value: "TR" },
  { title: "Ukrainian", value: "UK" },
  { title: "Chinese", value: "ZH" },
];

const FORMALITY = [
  { title: "Default", value: "default" },
  { title: "More Formal", value: "prefer_more" },
  { title: "Less Formal", value: "prefer_less" },
];

const MODEL_TYPES: { title: string; value: ModelType | "" }[] = [
  { title: "Default", value: "" },
  { title: "Quality Optimized", value: "quality_optimized" },
  { title: "Latency Optimized", value: "latency_optimized" },
  { title: "Prefer Quality", value: "prefer_quality_optimized" },
];

const SPLIT_SENTENCES: { title: string; value: SplitSentences | "" }[] = [
  { title: "Default (Split)", value: "" },
  { title: "No splitting", value: "0" },
  { title: "Split on punctuation", value: "1" },
  { title: "Split, no newlines", value: "nonewlines" },
];

const TAG_HANDLING: { title: string; value: TagHandling | "" }[] = [
  { title: "None", value: "" },
  { title: "XML", value: "xml" },
  { title: "HTML", value: "html" },
];

interface FormValues {
  text: string;
  sourceLang: string;
  targetLang: string;
  formality: string;
  modelType: string;
  splitSentences: string;
  preserveFormatting: boolean;
  context: string;
  glossaryId: string;
  tagHandling: string;
  outlineDetection: boolean;
  nonSplittingTags: string;
  splittingTags: string;
  ignoreTags: string;
}

export default function Command() {
  const prefs = getPrefs();
  const isSelected = useRef(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { data: glossaries } = useCachedPromise(listGlossaries, [], {
    keepPreviousData: true,
  });

  const { handleSubmit, itemProps, setValue, values } = useForm<FormValues>({
    initialValues: {
      text: "",
      sourceLang: "",
      targetLang: prefs.translateTargetLang,
      formality: prefs.formality,
      modelType: prefs.defaultModelType || "",
      splitSentences: "",
      preserveFormatting: prefs.preserveFormatting,
      context: "",
      glossaryId: "",
      tagHandling: "",
      outlineDetection: true,
      nonSplittingTags: "",
      splittingTags: "",
      ignoreTags: "",
    },
    validation: { text: FormValidation.Required },
    async onSubmit(v) {
      try {
        const opts: Partial<TranslateOptions> = {
          sourceLang: v.sourceLang || undefined,
          targetLang: v.targetLang,
          formality: v.formality as TranslateOptions["formality"],
          modelType: (v.modelType || undefined) as ModelType | undefined,
          splitSentences: (v.splitSentences || undefined) as
            | SplitSentences
            | undefined,
          preserveFormatting: v.preserveFormatting,
          context: v.context || undefined,
          glossaryId: v.glossaryId || undefined,
          tagHandling: (v.tagHandling || undefined) as TagHandling | undefined,
          outlineDetection:
            v.tagHandling === "xml" ? v.outlineDetection : undefined,
          nonSplittingTags: v.nonSplittingTags
            ? v.nonSplittingTags.split(",").map((s) => s.trim())
            : undefined,
          splittingTags: v.splittingTags
            ? v.splittingTags.split(",").map((s) => s.trim())
            : undefined,
          ignoreTags: v.ignoreTags
            ? v.ignoreTags.split(",").map((s) => s.trim())
            : undefined,
        };
        const result = await translateText(v.text, opts);
        const detectedLang = getLanguageName(result.detectedSourceLanguage);
        const billedMsg = result.billedCharacters
          ? ` (${result.billedCharacters} chars)`
          : "";

        if (isSelected.current) {
          await Clipboard.paste(result.text);
          await showToast({
            style: Toast.Style.Success,
            title: "Text translated",
            message: `From ${detectedLang}${billedMsg}`,
          });
        } else {
          await Clipboard.copy(result.text);
          await showToast({
            style: Toast.Style.Success,
            title: "Copied to clipboard",
            message: `From ${detectedLang}${billedMsg}`,
          });
        }
        await popToRoot();
      } catch (e) {
        const title =
          e instanceof DeepLError ? e.message : "Failed to translate";
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

  const filteredGlossaries = glossaries?.filter((g: Glossary) => {
    if (!values.sourceLang && !values.targetLang) return true;
    const srcMatch =
      !values.sourceLang ||
      g.source_lang.toUpperCase() === values.sourceLang.toUpperCase();
    const tgtMatch = g.target_lang
      .toUpperCase()
      .startsWith(values.targetLang.split("-")[0].toUpperCase());
    return srcMatch && tgtMatch;
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Translate" onSubmit={handleSubmit} />
          <Action
            title={showAdvanced ? "Hide Advanced" : "Show Advanced"}
            onAction={() => setShowAdvanced(!showAdvanced)}
            shortcut={{ modifiers: ["cmd"], key: "." }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Text" {...itemProps.text} />
      <Form.Dropdown title="From" {...itemProps.sourceLang}>
        {SOURCE_LANGUAGES.map((l) => (
          <Form.Dropdown.Item key={l.value || "auto"} {...l} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="To" {...itemProps.targetLang}>
        {TARGET_LANGUAGES.map((l) => (
          <Form.Dropdown.Item key={l.value} {...l} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Formality" {...itemProps.formality}>
        {FORMALITY.map((f) => (
          <Form.Dropdown.Item key={f.value} {...f} />
        ))}
      </Form.Dropdown>

      {showAdvanced && (
        <>
          <Form.Separator />
          <Form.Description
            title="Advanced"
            text="Additional translation options"
          />
          <Form.Dropdown title="Model" {...itemProps.modelType}>
            {MODEL_TYPES.map((m) => (
              <Form.Dropdown.Item key={m.value || "default"} {...m} />
            ))}
          </Form.Dropdown>
          <Form.Dropdown title="Split Sentences" {...itemProps.splitSentences}>
            {SPLIT_SENTENCES.map((s) => (
              <Form.Dropdown.Item key={s.value || "default"} {...s} />
            ))}
          </Form.Dropdown>
          <Form.Checkbox
            label="Preserve Formatting"
            {...itemProps.preserveFormatting}
          />
          <Form.TextArea
            title="Context"
            placeholder="Additional context for better translation..."
            {...itemProps.context}
          />

          {filteredGlossaries && filteredGlossaries.length > 0 && (
            <Form.Dropdown title="Glossary" {...itemProps.glossaryId}>
              <Form.Dropdown.Item title="None" value="" />
              {filteredGlossaries.map((g: Glossary) => (
                <Form.Dropdown.Item
                  key={g.glossary_id}
                  title={`${g.name} (${g.source_lang}→${g.target_lang})`}
                  value={g.glossary_id}
                />
              ))}
            </Form.Dropdown>
          )}

          <Form.Dropdown title="Tag Handling" {...itemProps.tagHandling}>
            {TAG_HANDLING.map((t) => (
              <Form.Dropdown.Item key={t.value || "none"} {...t} />
            ))}
          </Form.Dropdown>

          {values.tagHandling === "xml" && (
            <>
              <Form.Checkbox
                label="Outline Detection"
                {...itemProps.outlineDetection}
              />
              <Form.TextField
                title="Non-splitting Tags"
                placeholder="tag1, tag2"
                {...itemProps.nonSplittingTags}
              />
              <Form.TextField
                title="Splitting Tags"
                placeholder="tag1, tag2"
                {...itemProps.splittingTags}
              />
              <Form.TextField
                title="Ignore Tags"
                placeholder="tag1, tag2"
                {...itemProps.ignoreTags}
              />
            </>
          )}
        </>
      )}
    </Form>
  );
}
