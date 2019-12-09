import ActionTypes from "../actions/ActionTypes";
import { FocusTargetTypes } from "../actions/setFocusAction";

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
    cabinetIds: [], // for the ordered list displayed
    focussedCabinetId: null,
    editingCabinetId: null
  },
  myHerbarium: {
    loading: false,
    error: false
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

    // MY HERBARIUM
    case ActionTypes.FETCH_MY_HERBARIUM_BEGIN:
      return {
        ...state,
        myHerbarium: {
          ...state.myHerbarium,
          loading: true,
          error: false
        }
      };
    case ActionTypes.FETCH_MY_HERBARIUM_SUCCESS:
      console.log(action.payload);
      return {
        ...state,
        myHerbarium: {
          ...state.myHerbarium,
          loading: false,
          error: false
        },
        folders: {
          ...state.folders,
          byId: { ...action.payload.folders }
        },
        cabinets: {
          ...state.cabinets,
          byId: { ...action.payload.cabinets },
          cabinetIds: [...action.payload.cabinetIds]
        }
      };
    case ActionTypes.FETCH_MY_HERBARIUM_FAILURE:
      return {
        ...state,
        myHerbarium: {
          ...state.myHerbarium,
          loading: false,
          error: action.payload.error
        }
      };

    case ActionTypes.SET_FOCUS:
      if (action.targetType == FocusTargetTypes.FOLDER) {
        return {
          ...state,
          folders: {
            ...state.folders,
            focussedFolderId: action.targetId
          }
        };
      }
      if (action.targetType == FocusTargetTypes.CABINET) {
        return {
          ...state,
          cabinets: {
            ...state.cabinets,
            focussedCabinetId: action.targetId
          }
        };
      }

    case ActionTypes.NEW_CABINET:
      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: "_NEW_"
        }
      };

    case ActionTypes.EDIT_CABINET:
      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: action.cabinetId
        }
      };

    default:
      return state;
  }
};
export default rootReducer;
