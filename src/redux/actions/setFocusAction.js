import ActionTypes from "./ActionTypes";

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
