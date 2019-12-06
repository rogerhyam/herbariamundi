import ActionTypes from "../actions/ActionTypes";

// building this structure before was start
// saves lots of checking for things being defined or not
// later
const initialState = {
  specimens: {
    byId: {},
    workbench: {
      specimenIds: []
    },
    browser: {
      loading: false,
      error: null,
      title: null,
      associatedFolder: null,
      description: null,
      specimenIds: []
    }
  },
  folders: {
    byId: {}, // dictionary for lookup of objects
    focussedFolderId: null
  },
  cabinets: {
    byId: {}, // dictionary for lookup of objects
    cabinetIds: [] // for the ordered list displayed
  }
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_SPECIMENS_BEGIN:
      return {
        ...state,
        specimens: {
          ...state.specimens,
          browser: {
            ...state.specimens.browser,
            loading: true,
            error: null
          }
        }
      };
    case ActionTypes.FETCH_SPECIMENS_SUCCESS:
      return {
        ...state,
        specimens: {
          ...state.specimens,
          loading: false,
          byId: { ...state.specimens.byId, ...action.payload.specimens },
          browser: {
            specimenIds: Object.keys(action.payload.specimens),
            loading: false,
            error: null
          }
        }
      };
    case ActionTypes.FETCH_SPECIMENS_FAILURE:
      return {
        ...state,
        specimens: {
          ...state.specimens,
          browser: {
            ...state.specimens.browser,
            loading: false,
            error: action.payload.error
          }
        }
      };
    case ActionTypes.WORKSPACE_ADD_SPECIMEN:
      state.specimens.workbench.specimenIds.push(action.specimen);
      // de duplicate
      state.specimens.workbench.specimenIds = [
        ...new Set(state.specimens.workbench.specimenIds)
      ];
      return { ...state };

    case ActionTypes.SHOW_SPECIMENS:
      state.specimens.browser = { ...state.specimens.browser, ...action };
      delete state.specimens.browser.type;
      return { ...state };

    default:
      return state;
  }
};
export default rootReducer;

// export default combineReducers({
//   specimens: fetchSpecimensReducer,
//   workspace: workspaceReducer
// });
