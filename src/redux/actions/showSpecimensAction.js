import ActionTypes from "./actionTypes";

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
