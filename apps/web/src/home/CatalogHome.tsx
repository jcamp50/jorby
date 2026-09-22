import type { LucideIcon } from 'lucide-react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { SnapshotCard, SnapshotRow } from '@/components/jorby/snapshot-row'
import { Tile } from '@/components/jorby/tile'
import type { TileTone } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { ActivityFeed, type HomeActivity } from '@/home/ActivityFeed'

export type HomeSnapshot = {
  to: string
  icon: LucideIcon
  tone: TileTone
  title: string
  value: string
}

export type HomeQueuedItem = {
  key: string
  to: string
  tone: TileTone
  icon: LucideIcon
  title: string
  subtitle?: string
  tag: string
}

export function CatalogHome({
  title,
  activity,
  activityLoading,
  snapshots,
  queued,
  now,
  youActorIds,
}: {
  title: string
  activity: HomeActivity[]
  activityLoading?: boolean
  snapshots: HomeSnapshot[]
  queued: HomeQueuedItem[]
  now?: number
  youActorIds?: readonly string[]
}) {
  return (
    <div>
      <ScreenHeader title={title} />

      <ActivityFeed
        activity={activity}
        loading={activityLoading}
        now={now}
        youActorIds={youActorIds}
      />

      <SnapshotRow label="Around the house">
        {snapshots.map((card) => (
          <SnapshotCard
            key={card.title}
            to={card.to}
            icon={card.icon}
            tone={card.tone}
            title={card.title}
            value={card.value}
          />
        ))}
      </SnapshotRow>

      <CardGroup label="We should">
        {queued.length === 0 ? (
          <EmptyState>Nothing in the household queue yet.</EmptyState>
        ) : (
          <RowList>
            {queued.map((item) => (
              <LinkRow
                key={item.key}
                to={item.to}
                leading={<Tile icon={item.icon} tone={item.tone} />}
                title={item.title}
                subtitle={item.subtitle}
                meta={
                  <Badge variant="secondary" className="rounded-full">
                    {item.tag}
                  </Badge>
                }
              />
            ))}
          </RowList>
        )}
      </CardGroup>
    </div>
  )
}
