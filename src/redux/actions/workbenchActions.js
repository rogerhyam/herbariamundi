import ActionTypes from "./ActionTypes";

// action creator returns
export function addSpecimen(specimenId) {
  return {
    type: ActionTypes.WORKBENCH_ADD_SPECIMEN,
    specimenId
  };
}
