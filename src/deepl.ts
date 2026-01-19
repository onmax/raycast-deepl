import { getPreferenceValues } from "@raycast/api";

export interface DeepLPreferences {
  apiKey: string;
  apiType: "free" | "pro";
  targetLang: string;
  writingStyle: string;
  tone: string;
  translateTargetLang: string;
  formality: string;
  defaultModelType: string;
  preserveFormatting: boolean;
  showBilledCharacters: boolean;
}

export function getPrefs() {
  return getPreferenceValues<DeepLPreferences>();
}

export function getBaseUrl() {
  const { apiType } = getPrefs();
  return apiType === "free"
    ? "https://api-free.deepl.com/v2"
    : "https://api.deepl.com/v2";
}

export function getAuthHeader() {
  return { Authorization: `DeepL-Auth-Key ${getPrefs().apiKey}` };
}

const ERROR_MESSAGES: Record<number, string> = {
  400: "Bad request. Check your parameters.",
  403: "Authorization failed. Check your API key.",
  404: "Resource not found.",
  413: "Request too large. Text exceeds size limit.",
  429: "Too many requests. Please wait.",
  456: "Quota exceeded. Check your DeepL plan.",
  500: "Internal server error.",
  503: "Service temporarily unavailable.",
  529: "Too many requests. Please wait.",
};

export class DeepLError extends Error {
  constructor(
    public status: number,
    public body?: unknown,
  ) {
    const msg = ERROR_MESSAGES[status] || `DeepL API error: ${status}`;
    super(msg);
    this.name = "DeepLError";
  }
}

async function request<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => undefined);
    throw new DeepLError(res.status, errorBody);
  }
  return res.json() as Promise<T>;
}

async function requestGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "GET",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new DeepLError(res.status);
  return res.json() as Promise<T>;
}

async function requestDelete(endpoint: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new DeepLError(res.status);
}

export type ModelType =
  | "latency_optimized"
  | "quality_optimized"
  | "prefer_quality_optimized";
export type SplitSentences = "0" | "1" | "nonewlines";
export type TagHandling = "xml" | "html";
export type Formality =
  | "default"
  | "more"
  | "less"
  | "prefer_more"
  | "prefer_less";

export interface TranslateOptions {
  sourceLang?: string;
  targetLang: string;
  formality?: Formality;
  modelType?: ModelType;
  splitSentences?: SplitSentences;
  preserveFormatting?: boolean;
  context?: string;
  glossaryId?: string;
  tagHandling?: TagHandling;
  outlineDetection?: boolean;
  nonSplittingTags?: string[];
  splittingTags?: string[];
  ignoreTags?: string[];
  showBilledCharacters?: boolean;
}

export interface TranslateResult {
  text: string;
  detectedSourceLanguage: string;
  billedCharacters?: number;
}

interface TranslateResponse {
  translations: Array<{
    text: string;
    detected_source_language: string;
    billed_characters?: number;
  }>;
}

export async function translate(
  text: string,
  options: TranslateOptions,
): Promise<TranslateResult> {
  const body: Record<string, unknown> = {
    text: [text],
    target_lang: options.targetLang,
  };
  if (options.sourceLang) body.source_lang = options.sourceLang;
  if (options.formality && options.formality !== "default")
    body.formality = options.formality;
  if (options.modelType) body.model_type = options.modelType;
  if (options.splitSentences) body.split_sentences = options.splitSentences;
  if (options.preserveFormatting)
    body.preserve_formatting = options.preserveFormatting;
  if (options.context) body.context = options.context;
  if (options.glossaryId) body.glossary_id = options.glossaryId;
  if (options.tagHandling) body.tag_handling = options.tagHandling;
  if (options.outlineDetection !== undefined)
    body.outline_detection = options.outlineDetection;
  if (options.nonSplittingTags?.length)
    body.non_splitting_tags = options.nonSplittingTags;
  if (options.splittingTags?.length)
    body.splitting_tags = options.splittingTags;
  if (options.ignoreTags?.length) body.ignore_tags = options.ignoreTags;
  if (options.showBilledCharacters) body.show_billed_characters = true;

  const data = await request<TranslateResponse>("/translate", body);
  const t = data.translations[0];
  return {
    text: t.text,
    detectedSourceLanguage: t.detected_source_language,
    billedCharacters: t.billed_characters,
  };
}

export type WritingStyle =
  | "default"
  | "academic"
  | "business"
  | "casual"
  | "simple"
  | "prefer_academic"
  | "prefer_business"
  | "prefer_casual"
  | "prefer_simple";
export type Tone =
  | "default"
  | "confident"
  | "diplomatic"
  | "enthusiastic"
  | "friendly"
  | "prefer_confident"
  | "prefer_diplomatic"
  | "prefer_enthusiastic"
  | "prefer_friendly";

export interface RewriteOptions {
  targetLang: string;
  writingStyle?: WritingStyle;
  tone?: Tone;
}

interface RewriteResponse {
  improvements: Array<{ text: string }>;
}

export async function rewrite(
  text: string,
  options: RewriteOptions,
): Promise<string> {
  const body: Record<string, unknown> = {
    text: [text],
    target_lang: options.targetLang.toUpperCase(),
  };
  if (options.writingStyle && options.writingStyle !== "default")
    body.writing_style = options.writingStyle;
  if (options.tone && options.tone !== "default") body.tone = options.tone;

  const data = await request<RewriteResponse>("/write/rephrase", body);
  return data.improvements[0].text;
}

export interface Glossary {
  glossary_id: string;
  name: string;
  ready: boolean;
  source_lang: string;
  target_lang: string;
  creation_time: string;
  entry_count: number;
}

interface GlossaryListResponse {
  glossaries: Glossary[];
}

export async function listGlossaries(): Promise<Glossary[]> {
  const data = await requestGet<GlossaryListResponse>("/glossaries");
  return data.glossaries;
}

export async function getGlossary(id: string): Promise<Glossary> {
  return requestGet<Glossary>(`/glossaries/${id}`);
}

export async function getGlossaryEntries(id: string): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/glossaries/${id}/entries`, {
    method: "GET",
    headers: { ...getAuthHeader(), Accept: "text/tab-separated-values" },
  });
  if (!res.ok) throw new DeepLError(res.status);
  return res.text();
}

export async function createGlossary(
  name: string,
  sourceLang: string,
  targetLang: string,
  entriesTsv: string,
): Promise<Glossary> {
  return request<Glossary>("/glossaries", {
    name,
    source_lang: sourceLang,
    target_lang: targetLang,
    entries: entriesTsv,
    entries_format: "tsv",
  });
}

export async function deleteGlossary(id: string): Promise<void> {
  return requestDelete(`/glossaries/${id}`);
}

const LANG_NAMES: Record<string, string> = {
  BG: "Bulgarian",
  CS: "Czech",
  DA: "Danish",
  DE: "German",
  EL: "Greek",
  EN: "English",
  "EN-GB": "English (UK)",
  "EN-US": "English (US)",
  ES: "Spanish",
  ET: "Estonian",
  FI: "Finnish",
  FR: "French",
  HU: "Hungarian",
  ID: "Indonesian",
  IT: "Italian",
  JA: "Japanese",
  KO: "Korean",
  LT: "Lithuanian",
  LV: "Latvian",
  NB: "Norwegian",
  NL: "Dutch",
  PL: "Polish",
  PT: "Portuguese",
  "PT-BR": "Portuguese (BR)",
  "PT-PT": "Portuguese (PT)",
  RO: "Romanian",
  RU: "Russian",
  SK: "Slovak",
  SL: "Slovenian",
  SV: "Swedish",
  TR: "Turkish",
  UK: "Ukrainian",
  ZH: "Chinese",
  "ZH-HANS": "Chinese (Simplified)",
  "ZH-HANT": "Chinese (Traditional)",
};

export function getLanguageName(code: string): string {
  return LANG_NAMES[code.toUpperCase()] || code;
}
