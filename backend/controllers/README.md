# This folder contains the controllers that power the backend.

## Group controllers
An overview of all the group-related controllers in the backend API.

---

## Controllers

### `groupHomeHandler`
Returns the group dashboard data for a specific group. Currently a placeholder that will be expanded with posts and group activity in the future.

---

### `findGroupHandler`
Searches for groups by name using a query parameter. Returns all groups if no query is provided, or filters by partial name match if a search query is given.

---

### `createGroupHandler`
Creates a new group with a name, description, icon, and color. Validates that the group name doesn't already exist before saving it to the database.

---

### `updateGroupHandler`
Updates an existing group's name, description, icon, and color. Only members of the group are authorized to make changes.

---

### `getGroupDetailsHandler`
Fetches full details of a group by ID. Restricts access to members only, returning a `403` error if the requesting user is not a member.

---

### `joinGroupHandler`
Adds a user to a group's member list. Returns a soft error if the user is already a member rather than failing outright.

---

### `leaveGroupHandler`
Removes a user from a group's member list by filtering them out of the UID array.

---

### `getUserJoinedGroupsHandler`
Fetches all groups that a specific user is a member of, returning basic group info like name, member count, icon, and color.

---

### `saveQuizHandler`
Saves a generated quiz to a group's saved quizzes list, tagging it with the user who saved it and the timestamp.

---

### `saveSummaryHandler`
Saves a generated summary to a group's saved summaries list, tagging it with the user who saved it and the timestamp.

---

### `getSavedQuizzesHandler`
Retrieves all saved quizzes for a given group.

---

### `getSavedSummariesHandler`
Retrieves all saved summaries for a given group.


## Home controllers
-


## RAG controllers
-