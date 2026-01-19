import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Icon,
  List,
} from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import { DeepLError, deleteGlossary, Glossary, listGlossaries } from "./deepl";
import GlossaryView from "./glossary-view";

export default function Command() {
  const {
    data: glossaries,
    isLoading,
    revalidate,
  } = useCachedPromise(listGlossaries);

  async function handleDelete(glossary: Glossary) {
    const confirmed = await confirmAlert({
      title: "Delete Glossary",
      message: `Delete "${glossary.name}"?`,
      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
    });
    if (!confirmed) return;

    try {
      await deleteGlossary(glossary.glossary_id);
      await revalidate();
    } catch (e) {
      const title = e instanceof DeepLError ? e.message : "Failed to delete";
      await showFailureToast(e, { title });
    }
  }

  return (
    <List isLoading={isLoading}>
      {glossaries?.length === 0 && (
        <List.EmptyView
          title="No glossaries"
          description="Create one with the action below"
        />
      )}
      {glossaries?.map((g) => (
        <List.Item
          key={g.glossary_id}
          title={g.name}
          subtitle={`${g.source_lang} → ${g.target_lang}`}
          accessories={[
            { text: `${g.entry_count} entries` },
            {
              tag: {
                value: g.ready ? "Ready" : "Processing",
                color: g.ready ? Color.Green : Color.Orange,
              },
            },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Entries"
                icon={Icon.Eye}
                target={
                  <GlossaryView
                    glossaryId={g.glossary_id}
                    onDelete={revalidate}
                  />
                }
              />
              <Action
                title="Delete"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => handleDelete(g)}
                shortcut={{ modifiers: ["cmd"], key: "backspace" }}
              />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={revalidate}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
