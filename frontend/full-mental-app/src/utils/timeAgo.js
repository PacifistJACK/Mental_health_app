export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const diff =
    (Date.now() - timestamp.toDate().getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return timestamp.toDate().toLocaleDateString();
};
