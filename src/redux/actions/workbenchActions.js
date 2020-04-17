import ActionTypes from "./actionTypes";

// action creator returns
export function addSpecimen(specimenId) {
  return {
    type: ActionTypes.WORKBENCH_ADD_SPECIMEN,
    specimenId
  };
}

export function removeSpecimen(specimenId) {
  return {
    type: ActionTypes.WORKBENCH_REMOVE_SPECIMEN,
    specimenId
  };
}
