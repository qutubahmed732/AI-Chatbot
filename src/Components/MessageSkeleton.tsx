const MessageSkeleton = () => (
  <div className="flex justify-start animate-pulse">
    <div className="flex gap-3 flex-row items-end">
      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
      <div className="space-y-2">
        <div className="h-4 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
      </div>
    </div>
  </div>
);

export default MessageSkeleton;