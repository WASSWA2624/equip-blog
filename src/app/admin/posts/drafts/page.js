import PostInventoryScreen from "@/components/admin/post-inventory-screen";
import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { getPostInventorySnapshot } from "@/features/posts";

export default async function DraftsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const [messages, snapshot] = await Promise.all([
    getMessages(defaultLocale),
    getPostInventorySnapshot({
      page: resolvedSearchParams.page,
      scope: "drafts",
      search: resolvedSearchParams.search,
    }),
  ]);

  return <PostInventoryScreen copy={messages.admin.draftsList} initialData={snapshot} />;
}
