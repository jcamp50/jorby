export function SectionPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="mx-auto max-w-lg space-y-3">
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">
        Ontology queries and Actions are not connected yet. Generated OSDK names must be used after the SDK is imported.
      </p>
    </section>
  )
}
