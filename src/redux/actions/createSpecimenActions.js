import ActionTypes from "./ActionTypes";

export function createSpecimen(specimenData) {
  return dispatch => {
    dispatch(createSpecimenBegin());

    const requestOptions = {
      method: "POST",
      body: JSON.stringify(specimenData)
    };

    return fetch("/specimen_create.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(createSpecimenSuccess(json));
        return json;
      })
      .catch(error => dispatch(createSpecimenFailure(error)));
  };
}

export const createSpecimenBegin = () => ({
  type: ActionTypes.CREATE_SPECIMEN_BEGIN
});

export const createSpecimenSuccess = newSpecimen => ({
  type: ActionTypes.CREATE_SPECIMEN_SUCCESS,
  newSpecimen
});

export const createSpecimenFailure = error => ({
  type: ActionTypes.CREATE_SPECIMEN_FAILURE,
  payload: { error }
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
