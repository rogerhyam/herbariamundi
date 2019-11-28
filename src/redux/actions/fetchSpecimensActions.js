import {
  FETCH_SPECIMENS_BEGIN,
  FETCH_SPECIMENS_SUCCESS,
  FETCH_SPECIMENS_FAILURE
} from "./actionTypes";

export function fetchSpecimens() {
  return dispatch => {
    dispatch(fetchSpecimensBegin());
    return fetch("http://localhost:3100/data/random_specimens.php")
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
  type: FETCH_SPECIMENS_BEGIN
});

export const fetchSpecimensSuccess = products => ({
  type: FETCH_SPECIMENS_SUCCESS,
  payload: { products }
});

export const fetchSpecimensFailure = error => ({
  type: FETCH_SPECIMENS_FAILURE,
  payload: { error }
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
