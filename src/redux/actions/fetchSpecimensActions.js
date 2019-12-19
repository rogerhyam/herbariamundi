import ActionTypes from "./ActionTypes";

export function fetchSpecimens(searchParams) {
  return dispatch => {
    dispatch(fetchSpecimensBegin());

    const requestOptions = {
      method: "POST",
      body: JSON.stringify(searchParams),
      headers: {
        Accept: "application/json"
      }
    };

    return fetch("/fetch_specimens.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchSpecimensSuccess(json));
        return json;
      })
      .catch(error => dispatch(fetchSpecimensFailure(error)));
  };
}

export const fetchSpecimensBegin = searchParams => ({
  type: ActionTypes.FETCH_SPECIMENS_BEGIN,
  searchParams
});

export const fetchSpecimensSuccess = response => ({
  type: ActionTypes.FETCH_SPECIMENS_SUCCESS,
  response
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
