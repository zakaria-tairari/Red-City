import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

/**
 * RecentActivity Component
 * Displays a list of the user's recent actions (saves, views, reviews) within the platform.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.activities] - Optional custom activity logs array
 */
export default function RecentActivity({ activities }) {
  const defaultActivities = [
    { id: 1, action: 'Saved', place: 'Jardin Majorelle', time: '2 hours ago' },
    { id: 2, action: 'Reviewed', place: 'Nomad', time: 'Yesterday' },
    { id: 3, action: 'Viewed', place: 'Royal Mansour', time: '2 days ago' },
  ]

  const list = activities || defaultActivities

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">
                {item.action}{' '}
                <span className="text-primary-600 font-semibold">
                  {item.place}
                </span>
              </p>
              <p className="text-xs text-stone-400">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
