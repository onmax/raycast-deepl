import { Clipboard, getPreferenceValues, getSelectedText, showToast, Toast } from "@raycast/api"

interface Preferences { apiKey: string }

export default async function Command() {
  const { apiKey } = getPreferenceValues<Preferences>()

  let text: string
  let isSelected = false
  try {
    text = await getSelectedText()
    isSelected = true
  } catch {
    text = (await Clipboard.readText()) ?? ""
  }

  if (!text.trim()) {
    await showToast({ style: Toast.Style.Failure, title: "No text found" })
    return
  }

  try {
    const res = await fetch("https://api.deepl.com/v2/write/rephrase", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `DeepL-Auth-Key ${apiKey}` },
      body: JSON.stringify({ text: [text], target_lang: "EN" }),
    })

    if (!res.ok) throw new Error(`DeepL API error: ${res.status}`)

    const data = (await res.json()) as { improvements: { text: string }[] }
    const result = data.improvements[0].text

    if (isSelected) {
      await Clipboard.paste(result)
      await showToast({ style: Toast.Style.Success, title: "Text replaced" })
    } else {
      await Clipboard.copy(result)
      await showToast({ style: Toast.Style.Success, title: "Copied to clipboard" })
    }
  } catch (e) {
    await showToast({ style: Toast.Style.Failure, title: "Failed to rewrite", message: String(e) })
  }
}
