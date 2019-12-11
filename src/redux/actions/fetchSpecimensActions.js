import ActionTypes from "./ActionTypes";

export function fetchSpecimens() {
  return dispatch => {
    dispatch(fetchSpecimensBegin());
    return fetch("/random_specimens.php", {
      headers: {
        Accept: "application/json"
      }
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchSpecimensSuccess(json));
        return json;
      })
      .catch(error => dispatch(fetchSpecimensFailure(error)));
  };
}

export const fetchSpecimensBegin = () => ({
  type: ActionTypes.FETCH_SPECIMENS_BEGIN
});

export const fetchSpecimensSuccess = specimens => ({
  type: ActionTypes.FETCH_SPECIMENS_SUCCESS,
  payload: { specimens }
});

export const fetchSpecimensFailure = error => ({
  type: ActionTypes.FETCH_SPECIMENS_FAILURE,
  payload: { error }
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
