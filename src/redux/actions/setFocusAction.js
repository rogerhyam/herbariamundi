import ActionTypes from "./actionTypes";

export const FocusTargetTypes = {
  FOLDER: "FOLDER",
  CABINET: "CABINET",
  SEARCH: "SEARCH"
};

export const setFocus = (targetType, targetId) => ({
  type: ActionTypes.SET_FOCUS,
  targetType,
  targetId
});
