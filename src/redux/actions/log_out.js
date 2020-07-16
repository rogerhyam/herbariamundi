import ActionTypes from "./actionTypes";
import { updateAuthenticationStatus } from "./updateAuthenticationStatus";

export function logout() {
    return dispatch => {

        dispatch(logoutBegin());

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/log_out.php", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(fullResponse => {
                dispatch(logoutSuccess(fullResponse));
                dispatch(updateAuthenticationStatus());
                return fullResponse;
            })
            .catch(error => dispatch(logoutFailure(error)));
    };
}

export const logoutBegin = searchParams => ({
    type: ActionTypes.LOG_OUT_BEGIN,
    searchParams
});

export const logoutSuccess = fullResponse => ({
    type: ActionTypes.LOG_OUT_SUCCESS,
    fullResponse
});

export const logoutFailure = error => ({
    type: ActionTypes.LOG_OUT_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
