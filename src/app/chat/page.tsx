import { getConversations } from "@/lib/actions/conversations";
import { getBooks } from "@/lib/actions/books";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string }>;
}) {
  const { bookId } = await searchParams;
  const [conversations, books] = await Promise.all([
    getConversations(),
    getBooks(),
  ]);

  return (
    <ChatClient
      initialConversations={conversations}
      books={books}
      initialBookId={bookId || null}
    />
  );
}
