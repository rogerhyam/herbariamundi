import ActionTypes from "./ActionTypes";

export const newCabinet = () => ({
  type: ActionTypes.NEW_CABINET
});

export const editCabinet = cabinetId => ({
  type: ActionTypes.EDIT_CABINET,
  cabinetId
});
