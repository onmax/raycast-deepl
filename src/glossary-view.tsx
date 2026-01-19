import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  Detail,
  Icon,
  List,
  popToRoot,
} from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import {
  DeepLError,
  deleteGlossary,
  getGlossary,
  getGlossaryEntries,
} from "./deepl";

interface Props {
  glossaryId: string;
  onDelete?: () => void;
}

export default function GlossaryView({ glossaryId, onDelete }: Props) {
  const { data: glossary, isLoading: loadingGlossary } = useCachedPromise(
    getGlossary,
    [glossaryId],
  );
  const { data: entriesTsv, isLoading: loadingEntries } = useCachedPromise(
    getGlossaryEntries,
    [glossaryId],
  );

  const entries =
    entriesTsv
      ?.split("\n")
      .filter(Boolean)
      .map((line) => {
        const [source, target] = line.split("\t");
        return { source, target };
      }) ?? [];

  async function handleDelete() {
    const confirmed = await confirmAlert({
      title: "Delete Glossary",
      message: `Delete "${glossary?.name}"?`,
      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
    });
    if (!confirmed) return;

    try {
      await deleteGlossary(glossaryId);
      onDelete?.();
      await popToRoot();
    } catch (e) {
      const title = e instanceof DeepLError ? e.message : "Failed to delete";
      await showFailureToast(e, { title });
    }
  }

  if (!glossary) {
    return (
      <Detail
        isLoading={loadingGlossary || loadingEntries}
        markdown="Loading..."
      />
    );
  }

  return (
    <List
      navigationTitle={glossary.name}
      isLoading={loadingGlossary || loadingEntries}
    >
      <List.Section
        title={`${glossary.source_lang} → ${glossary.target_lang}`}
        subtitle={`${entries.length} entries`}
      >
        {entries.map((e, i) => (
          <List.Item
            key={i}
            title={e.source}
            subtitle={e.target}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Source"
                  content={e.source}
                />
                <Action.CopyToClipboard
                  title="Copy Target"
                  content={e.target}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
                <Action
                  title="Delete Glossary"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={handleDelete}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
