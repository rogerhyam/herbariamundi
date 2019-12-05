import ActionTypes from "../actions/ActionTypes";

const workspaceReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.WORKSPACE_ADD_SPECIMEN:
      // we have an array of items
      let items;
      if (!state.items) items = [action.specimen];
      else items = state.items.concat([action.specimen]);

      return {
        ...state,
        loading: true,
        error: null,
        items: items
      };

    default:
      return state;
  }
};

export default workspaceReducer;
