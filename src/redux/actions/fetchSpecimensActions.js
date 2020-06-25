import ActionTypes from "./actionTypes";

export function fetchSpecimens(searchParams) {
  return dispatch => {
    dispatch(fetchSpecimensBegin(searchParams));

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
        let fullResponse = JSON.parse(json);
        // FIXME: throw error if we get error from SOLR
        dispatch(fetchSpecimensSuccess(fullResponse));
        return json;
      })
      .catch(error => dispatch(fetchSpecimensFailure(error)));
  };
}

export const fetchSpecimensBegin = searchParams => ({
  type: ActionTypes.FETCH_SPECIMENS_BEGIN,
  searchParams
});

export const fetchSpecimensSuccess = fullResponse => ({
  type: ActionTypes.FETCH_SPECIMENS_SUCCESS,
  fullResponse
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
