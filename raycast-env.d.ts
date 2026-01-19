/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** DeepL API Key - Your DeepL API key */
  "apiKey": string,
  /** API Type - Free or Pro DeepL API */
  "apiType": "pro" | "free",
  /** Rewrite Language - Target language for rewriting */
  "targetLang": "en-US" | "en-GB" | "de" | "es" | "fr" | "it" | "pt-BR" | "pt-PT",
  /** Writing Style - Writing style for rewriting */
  "writingStyle": "default" | "prefer_academic" | "prefer_business" | "prefer_casual" | "prefer_simple",
  /** Tone - Tone for rewriting */
  "tone": "default" | "prefer_confident" | "prefer_diplomatic" | "prefer_enthusiastic" | "prefer_friendly",
  /** Translate Target Language - Target language for translation */
  "translateTargetLang": "BG" | "CS" | "DA" | "DE" | "EL" | "EN-GB" | "EN-US" | "ES" | "ET" | "FI" | "FR" | "HU" | "ID" | "IT" | "JA" | "KO" | "LT" | "LV" | "NB" | "NL" | "PL" | "PT-BR" | "PT-PT" | "RO" | "RU" | "SK" | "SL" | "SV" | "TR" | "UK" | "ZH-HANS" | "ZH-HANT",
  /** Formality - Formality level for translation */
  "formality": "default" | "prefer_more" | "prefer_less",
  /** Translation Model - Model type for translation quality/speed */
  "defaultModelType": "" | "quality_optimized" | "latency_optimized" | "prefer_quality_optimized",
  /** Preserve Formatting - Preserve formatting in translations */
  "preserveFormatting": boolean,
  /** Show Billed Characters - Show character count in toast */
  "showBilledCharacters": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `rewrite` command */
  export type Rewrite = ExtensionPreferences & {}
  /** Preferences accessible in the `rewrite-options` command */
  export type RewriteOptions = ExtensionPreferences & {}
  /** Preferences accessible in the `translate` command */
  export type Translate = ExtensionPreferences & {}
  /** Preferences accessible in the `translate-options` command */
  export type TranslateOptions = ExtensionPreferences & {}
  /** Preferences accessible in the `glossary-list` command */
  export type GlossaryList = ExtensionPreferences & {}
  /** Preferences accessible in the `glossary-create` command */
  export type GlossaryCreate = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `rewrite` command */
  export type Rewrite = {}
  /** Arguments passed to the `rewrite-options` command */
  export type RewriteOptions = {}
  /** Arguments passed to the `translate` command */
  export type Translate = {}
  /** Arguments passed to the `translate-options` command */
  export type TranslateOptions = {}
  /** Arguments passed to the `glossary-list` command */
  export type GlossaryList = {}
  /** Arguments passed to the `glossary-create` command */
  export type GlossaryCreate = {}
}

