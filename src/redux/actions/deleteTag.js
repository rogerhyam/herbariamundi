import ActionTypes from "./actionTypes";

export function deleteTag(tagId, specimenId, specimenDbId) {
    return dispatch => {

        dispatch(deleteTagBegin(tagId, specimenId, specimenDbId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ tagId, specimenId, specimenDbId }),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/tags.php?verb=delete", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                // this is already json so no casting necessary ?
                dispatch(deleteTagSuccess(json));
                return json;
            })
            .catch(error => dispatch(deleteTagFailure(error)));
    };
}

export const deleteTagBegin = (tagId, specimenId, specimenDbId) => ({
    type: ActionTypes.DELETE_TAG_BEGIN,
    tagId,
    specimenId,
    specimenDbId
});

export const deleteTagSuccess = fullResponse => ({
    type: ActionTypes.DELETE_TAG_SUCCESS,
    fullResponse
});

export const deleteTagFailure = error => ({
    type: ActionTypes.DELETE_TAG_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
