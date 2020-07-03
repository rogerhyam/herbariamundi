import ActionTypes from "./actionTypes";

export const showSpecimens = (
  specimenIds = []
) => ({
  type: ActionTypes.SHOW_SPECIMENS,
  specimenIds
});
