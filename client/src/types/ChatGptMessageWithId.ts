/** known ChatGPT message roles */
export type ChatGptMessageRole = "system" | "user" | "assistant";

/** Generic ChatGPT role/content message payload, with an extra ID field */
export interface ChatGptMessageWithId {
  id: string;
  role: ChatGptMessageRole;
  content: string;
}

/** Create a ChatGptMessageWithId, auto-populating ID as necessary. */
export function createMessage(role: ChatGptMessageRole, content: string, id?: string): ChatGptMessageWithId {
  return { id: id || crypto.randomUUID(), role, content };
}

/** Strips `ChatGptMessageWithId.id` and serializes to JSON for sending upstream */
export function stringifyMessages(msgs: ChatGptMessageWithId[]) {
  return JSON.stringify({
    messages: msgs.map(({ role, content }) => ({ role, content }))
  });
}
