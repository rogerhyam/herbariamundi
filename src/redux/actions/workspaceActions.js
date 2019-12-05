import ActionTypes from "./ActionTypes";

// action creator returns
export function addSpecimen(specimen) {
  return {
    type: ActionTypes.WORKSPACE_ADD_SPECIMEN,
    specimen
  };
}
