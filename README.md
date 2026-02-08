<p align="center">
  <img src="assets/deepl-logo.png" width="128" height="128" alt="logo">
</p>
<h1 align="center">DeepL for Raycast</h1>

Rewrite and translate text using the [DeepL API](https://developers.deepl.com/docs/api-reference).

## Features

- **Rewrite**: Improve text with DeepL Write API (style, tone, language)
- **Translate**: Translate text with DeepL Translate API (32 languages, formality, model selection)
- **Glossaries**: Create and manage translation glossaries
- **Smart input**: Uses selected text when available, falls back to clipboard
- **Smart output**: Replaces selection or copies to clipboard

## Requirements

- DeepL API key ([Free](https://www.deepl.com/pro#developer) or [Pro](https://www.deepl.com/pro))
- Write API requires Pro subscription

## Setup

1. Install the extension
2. Get your API key from [DeepL Account](https://www.deepl.com/your-account/keys)
3. Enter the key when prompted on first run
4. Select API type (Free or Pro) in preferences

## Commands

| Command | Description |
|---------|-------------|
| **Rewrite Text** | Instant rewrite using preference defaults |
| **Rewrite with Options** | Form with language, style, tone, strict mode |
| **Translate Text** | Instant translation using preference defaults |
| **Translate with Options** | Form with advanced options (model, context, glossary, tags) |
| **Manage Glossaries** | View, delete glossaries |
| **Create Glossary** | Create glossary from TSV entries |

## Preferences

### General

| Preference | Description | Default |
|------------|-------------|---------|
| API Key | Your DeepL API key | Required |
| API Type | Free or Pro endpoint | Pro |
| Show Billed Characters | Show char count in toast | Yes |

### Rewrite

| Preference | Options | Default |
|------------|---------|---------|
| Language | EN (US/UK), DE, ES, FR, IT, PT (BR/PT) | EN-US |
| Writing Style | Default, Academic, Business, Casual, Simple | Default |
| Tone | Default, Confident, Diplomatic, Enthusiastic, Friendly | Default |

### Translate

| Preference | Options | Default |
|------------|---------|---------|
| Target Language | 32 languages | EN-US |
| Formality | Default, More Formal, Less Formal | Default |
| Model | Default, Quality Optimized, Latency Optimized | Default |
| Preserve Formatting | Keep original formatting | No |

## Advanced Translation Options

Press `⌘.` in Translate with Options to show:

- **Model**: Quality vs latency optimization
- **Split Sentences**: Control sentence splitting behavior
- **Context**: Additional context for better translation
- **Glossary**: Use a glossary for consistent terminology
- **Tag Handling**: XML/HTML tag preservation

## License

MIT
