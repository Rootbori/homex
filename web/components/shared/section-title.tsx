export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      ) : null}
      <div className="space-y-1">
        <h2 className="headline-font text-2xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm leading-6 text-on-surface-variant">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
