// Helper function to recursively get all indirect users
const getAllIndirectCaretakees = (caretakingFor, visitedPks = new Set()) => {
  let indirectUsers = [];

  caretakingFor?.forEach((directUser) => {
    // Skip if we've already processed this user to prevent infinite loops
    if (visitedPks.has(directUser.pk)) return;
    visitedPks.add(directUser.pk);

    // Add all users that the direct user is caretaking for
    if (directUser.caretaking_for?.length > 0) {
      directUser.caretaking_for.forEach((indirectUser) => {
        if (!visitedPks.has(indirectUser.pk)) {
          indirectUsers.push(indirectUser);

          // Recursively get any users that this indirect user is caretaking for
          const moreIndirectUsers = getAllIndirectCaretakees(
            [indirectUser],
            new Set([...visitedPks]),
          );
          indirectUsers = [...indirectUsers, ...moreIndirectUsers];
        }
      });
    }
  });

  return indirectUsers;
};

export default getAllIndirectCaretakees;
