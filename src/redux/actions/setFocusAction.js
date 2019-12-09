import ActionTypes from "./ActionTypes";

export const FocusTargetTypes = {
  FOLDER: "FOLDER",
  CABINET: "CABINET"
};

export const setFocus = (targetType, targetId) => ({
  type: ActionTypes.SET_FOCUS,
  targetType,
  targetId
});
