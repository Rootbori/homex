export function ProfileBubble({ image }: { image?: string }) {
  return (
    <div className="interactive-scale h-10 w-10 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-soft">
      {image ? (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-black tracking-tighter text-primary/40">HX</div>
      )}
    </div>
  );
}
