import ActionTypes from "./actionTypes";

export function fetchMyHerbarium() {
  return dispatch => {
    dispatch(fetchMyHerbariumBegin());
    return fetch("/fetch_my_herbarium.php")
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchMyHerbariumSuccess(json));
        return json;
      })
      .catch(error => dispatch(fetchMyHerbariumFailure(error)));
  };
}

export const fetchMyHerbariumBegin = () => ({
  type: ActionTypes.FETCH_MY_HERBARIUM_BEGIN
});

export const fetchMyHerbariumSuccess = myHerbarium => ({
  type: ActionTypes.FETCH_MY_HERBARIUM_SUCCESS,
  payload: myHerbarium
});

export const fetchMyHerbariumFailure = error => ({
  type: ActionTypes.FETCH_MY_HERBARIUM_FAILURE,
  payload: { error }
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
