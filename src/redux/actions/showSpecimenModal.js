import ActionTypes from "./actionTypes";

export const showSpecimenModal = (
    modalSpecimen
) => ({
    type: ActionTypes.SHOW_SPECIMEN_MODAL,
    modalSpecimen
});