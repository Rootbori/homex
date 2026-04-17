export function ProfileBubble({ image }: { image?: string }) {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-container bg-surface-container-high">
      {image ? (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">HX</div>
      )}
    </div>
  );
}
