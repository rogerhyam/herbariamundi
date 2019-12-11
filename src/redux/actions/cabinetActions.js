import ActionTypes from "./ActionTypes";

export const newCabinet = () => ({
  type: ActionTypes.NEW_CABINET
});

export const editCabinet = cabinetId => ({
  type: ActionTypes.EDIT_CABINET,
  cabinetId
});

export const editCabinetCancel = () => ({
  type: ActionTypes.EDIT_CABINET_CANCEL
});

export function editCabinetSave(cabinetId, title, description) {
  return dispatch => {
    dispatch(editCabinetSaveBegin(cabinetId));

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ cabinetId, title, description })
    };

    return fetch("/cabinet_save.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(editCabinetSaveSuccess(json));
        return json;
      })
      .catch(error => dispatch(editCabinetSaveFailure(error)));
  };
}

export const editCabinetSaveBegin = cabinetId => ({
  type: ActionTypes.EDIT_CABINET_SAVE_BEGIN,
  cabinetId
});

export const editCabinetSaveSuccess = cabinet => ({
  type: ActionTypes.EDIT_CABINET_SAVE_SUCCESS,
  payload: cabinet
});

export const editCabinetSaveFailure = error => ({
  type: ActionTypes.EDIT_CABINET_SAVE_FAILURE,
  payload: { error }
});

// REMOVE CABINATE
export function removeCabinet(cabinetId) {
  return dispatch => {
    return fetch("/remove_cabinet.php?cabinet_id=" + cabinetId, {
      headers: {
        Accept: "application/json"
      }
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(removeCabinetsSuccess(json));
        return json;
      })
      .catch(error => dispatch(removeCabinetsFailure(error)));
  };
}

export const removeCabinetsSuccess = cabinet => ({
  type: ActionTypes.REMOVE_CABINET_SUCCESS,
  cabinet
});

export const removeCabinetsFailure = error => ({
  type: ActionTypes.REMOVE_CABINET_FAILURE,
  payload: { error }
});

function handleErrors(response) {
  console.log(response);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
