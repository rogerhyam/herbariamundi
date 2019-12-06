import ActionTypes from "./ActionTypes";

export const showSpecimens = (
  specimenIds = [],
  associatedFolderId = null,
  title = null,
  description = null
) => ({
  type: ActionTypes.SHOW_SPECIMENS,
  specimenIds,
  associatedFolderId,
  title,
  description
});
