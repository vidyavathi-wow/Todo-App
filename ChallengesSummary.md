Summary of Challenges Faced During Development

Adding a new database column broke existing associations and impacted multiple app features.

Refreshing the app showed todos as unassigned due to assigned-user relationships not being preserved or fetched correctly.

Calendar filtering required fixes to correctly handle date and month selections with the new APIs.

Dashboard layout had major responsiveness issues, especially on mobile, causing sidebar overlap, spacing inconsistencies, and alignment problems.

Maintaining sync between local and remote Git repositories was challenging.

Merge conflicts occurred frequently when multiple branches modified shared todo logic, breaking state consistency.

LatestTodos component responsiveness was difficult to handle.

Soft delete and status filtering needed to work consistently across all components without breaking the calendar or dashboard.

Library version conflicts led to unpredictable UI behavior and event-rendering issues.
