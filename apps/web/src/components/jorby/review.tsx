import { Star } from 'lucide-react'
import { MemberMark } from '@/components/jorby/member-mark'
import { Rating } from '@/components/jorby/rating'
import { CardGroup, RowList } from '@/components/jorby/card-group'
import { EmptyState } from '@/components/jorby/screen'
import type { Member, MemberReview } from '@/prototype/model'

/**
 * Both people review the same subject, so reviews always render as a pair of
 * attributed rows rather than a single aggregate score.
 */
export function ReviewGroup({
  label = 'Reviews',
  reviews,
  members,
  emptyMessage,
  average,
  note,
}: {
  label?: string
  reviews: MemberReview[]
  members: Member[]
  emptyMessage: string
  average?: number | null
  note?: string
}) {
  const action =
    average != null ? (
      <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
        <Star className="size-3.5 fill-current" aria-hidden />
        {average.toFixed(1)}
        <span className="sr-only">average stars out of 5</span>
      </span>
    ) : undefined

  if (reviews.length === 0) {
    return (
      <CardGroup label={label} action={action}>
        <EmptyState>{emptyMessage}</EmptyState>
      </CardGroup>
    )
  }

  return (
    <CardGroup label={label} action={action}>
      {note ? <p className="px-4 pt-3 text-sm text-muted-foreground text-pretty">{note}</p> : null}
      <RowList>
        {reviews.map((review) => {
          const member = members.find((item) => item.id === review.membershipId)
          return (
            <div key={review.membershipId} className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                {member ? <MemberMark member={member} /> : null}
                <span className="text-[0.9375rem] font-semibold">{member?.displayName}</span>
                <Rating halfStars={review.ratingHalfStars} className="ml-auto" />
              </div>
              {review.reviewText ? (
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  {review.reviewText}
                </p>
              ) : null}
            </div>
          )
        })}
      </RowList>
    </CardGroup>
  )
}

/** Mean displayed stars across reviews, or null when nobody has reviewed. */
export function averageStars(reviews: MemberReview[]): number | null {
  if (reviews.length === 0) {
    return null
  }
  const total = reviews.reduce((sum, review) => sum + review.ratingHalfStars, 0)
  return total / reviews.length / 2
}
