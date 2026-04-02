import { getConversations } from "@/lib/actions/conversations";
import { getBooks } from "@/lib/actions/books";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  const [conversations, books] = await Promise.all([
    getConversations(),
    getBooks(),
  ]);

  return <ChatClient initialConversations={conversations} books={books} />;
}
