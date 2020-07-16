import ActionTypes from "./actionTypes";

export function updateAuthenticationStatus() {
    return dispatch => {

        dispatch(updateAuthenticationStatusBegin());

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/authentication_status.php", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(fullResponse => {
                //let fullResponse = JSON.parse(json);
                dispatch(updateAuthenticationStatusSuccess(fullResponse));
                return fullResponse;
            })
            .catch(error => dispatch(updateAuthenticationStatusFailure(error)));
    };
}

export const updateAuthenticationStatusBegin = searchParams => ({
    type: ActionTypes.UPDATE_AUTHENTICATION_STATUS_BEGIN,
    searchParams
});

export const updateAuthenticationStatusSuccess = fullResponse => ({
    type: ActionTypes.UPDATE_AUTHENTICATION_STATUS_SUCCESS,
    fullResponse
});

export const updateAuthenticationStatusFailure = error => ({
    type: ActionTypes.UPDATE_AUTHENTICATION_STATUS_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
