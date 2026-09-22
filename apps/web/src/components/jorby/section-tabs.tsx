import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SectionTabs({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="mb-4">
      <TabsList
        aria-label={label}
        className="w-full rounded-full bg-card/70 shadow-card backdrop-blur group-data-[orientation=horizontal]/tabs:h-13"
      >
        {options.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="flex-1 rounded-full data-[state=active]:bg-section data-[state=active]:text-white dark:data-[state=active]:bg-section dark:data-[state=active]:text-white"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
