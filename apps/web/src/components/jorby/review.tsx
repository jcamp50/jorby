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
}: {
  label?: string
  reviews: MemberReview[]
  members: Member[]
  emptyMessage: string
}) {
  if (reviews.length === 0) {
    return (
      <CardGroup label={label}>
        <EmptyState>{emptyMessage}</EmptyState>
      </CardGroup>
    )
  }

  return (
    <CardGroup label={label}>
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
