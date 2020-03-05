import ActionTypes from "./ActionTypes";

export const newFolder = cabinetId => ({
  type: ActionTypes.NEW_FOLDER,
  cabinetId
});

export const editFolder = folderId => ({
  type: ActionTypes.EDIT_FOLDER,
  folderId
});

export const editFolderCancel = () => ({
  type: ActionTypes.EDIT_FOLDER_CANCEL
});

export function editFolderSave(folderId, cabinetId = null, title, description) {
  return dispatch => {
    dispatch(editFolderSaveBegin(folderId));

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ folderId, title, description, cabinetId })
    };

    return fetch("/folder_save.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(editFolderSaveSuccess(json));
        return json;
      })
      .catch(error => dispatch(editFolderSaveFailure(error)));
  };
}

export const editFolderSaveBegin = folderId => ({
  type: ActionTypes.EDIT_FOLDER_SAVE_BEGIN,
  folderId
});

export const editFolderSaveSuccess = folder => ({
  type: ActionTypes.EDIT_FOLDER_SAVE_SUCCESS,
  payload: folder
});

export const editFolderSaveFailure = error => ({
  type: ActionTypes.EDIT_FOLDER_SAVE_FAILURE,
  payload: { error }
});

// REMOVE FOLDER
export function removeFolder(folderId) {
  return dispatch => {
    return fetch("/remove_folder.php?folder_id=" + folderId, {
      headers: {
        Accept: "application/json"
      }
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(removeFolderSuccess(json));
        return json;
      })
      .catch(error => dispatch(removeFolderFailure(error)));
  };
}

export const removeFolderSuccess = folder => ({
  type: ActionTypes.REMOVE_FOLDER_SUCCESS,
  folder
});

export const removeFolderFailure = error => ({
  type: ActionTypes.REMOVE_FOLDER_FAILURE,
  payload: { error }
});

// ADD SPECIMEN
export function addSpecimen(folderId, specimenDbId) {
  return dispatch => {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ folderId, specimenDbId })
    };

    return fetch("/folder_add_specimen.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(addSpecimenSuccess(json));
        return json;
      })
      .catch(error => dispatch(addSpecimenFailure(error)));
  };
}

export const addSpecimenSuccess = folder => ({
  type: ActionTypes.FOLDER_ADD_SPECIMEN_SUCCESS,
  folder
});

export const addSpecimenFailure = error => ({
  type: ActionTypes.FOLDER_ADD_SPECIMEN_FAILURE,
  payload: { error }
});

// REMOVE SPECIMEN
export function removeSpecimen(folderId, specimenId) {
  return dispatch => {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ folderId: folderId, specimenId: specimenId })
    };

    return fetch("/folder_remove_specimen.php", requestOptions)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(removeSpecimenSuccess(json));
        return json;
      })
      .catch(error => dispatch(removeSpecimenFailure(error)));
  };
}

export const removeSpecimenSuccess = folder => ({
  type: ActionTypes.FOLDER_REMOVE_SPECIMEN_SUCCESS,
  folder
});

export const removeSpecimenFailure = error => ({
  type: ActionTypes.FOLDER_REMOVE_SPECIMEN_FAILURE,
  payload: { error }
});

// ERRORS

function handleErrors(response) {
  console.log(response);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
