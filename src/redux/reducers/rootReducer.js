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
    focussedFolderId: null,
    editingFolderId: null,
    newFolderInCabinetId: null
  },
  cabinets: {
    byId: {}, // dictionary for lookup of objects
    cabinetIds: [], // for the ordered list displayed
    focussedCabinetId: null,
    editingCabinetId: null,
    loading: false,
    error: null
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
      if (action.targetType === FocusTargetTypes.FOLDER) {
        return {
          ...state,
          folders: {
            ...state.folders,
            focussedFolderId: action.targetId
          }
        };
      }
      if (action.targetType === FocusTargetTypes.CABINET) {
        return {
          ...state,
          cabinets: {
            ...state.cabinets,
            focussedCabinetId: action.targetId
          }
        };
      }
      break;
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

    case ActionTypes.EDIT_CABINET_CANCEL:
      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: false
        }
      };

    case ActionTypes.EDIT_CABINET_SAVE_BEGIN:
      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: action.cabinetId,
          loading: true
        }
      };

    case ActionTypes.EDIT_CABINET_SAVE_FAILURE:
      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: false,
          loading: false,
          error: action.payload.error
        }
      };

    case ActionTypes.EDIT_CABINET_SAVE_SUCCESS:
      const cabinet = action.payload;

      // add it to the list of ids incase it is new.
      // it will be removed later if it is already there.
      state.cabinets.cabinetIds.push(cabinet.id);

      return {
        ...state,
        cabinets: {
          ...state.cabinets,
          editingCabinetId: null,
          loading: false,
          error: null,
          byId: {
            ...state.cabinets.byId,
            [cabinet.id]: cabinet
          },
          cabinetIds: [...new Set(state.cabinets.cabinetIds)]
        }
      };

    case ActionTypes.REMOVE_CABINET_SUCCESS:
      delete state.cabinets.byId[action.cabinet.id];
      state.cabinets.cabinetIds.splice(
        state.cabinets.cabinetIds.indexOf(action.cabinet.id),
        1
      );
      return {
        ...state
      };

    // FIXME: handle failed cabinet removal

    // FOLDER STUFF

    case ActionTypes.NEW_FOLDER:
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: "_NEW_",
          newFolderInCabinetId: action.cabinetId
        }
      };

    case ActionTypes.EDIT_FOLDER:
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: action.folderId,
          newFolderInCabinetId: null
        }
      };

    case ActionTypes.EDIT_FOLDER_CANCEL:
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: null,
          newFolderInCabinetId: null
        }
      };

    case ActionTypes.EDIT_FOLDER_SAVE_BEGIN:
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: action.folderId,
          loading: true
        }
      };

    case ActionTypes.EDIT_FOLDER_SAVE_FAILURE:
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: false,
          newFolderInCabinetId: null,
          loading: false,
          error: action.payload.error
        }
      };

    case ActionTypes.EDIT_FOLDER_SAVE_SUCCESS:
      const folder = action.payload;
      const folderCabinet = state.cabinets.byId[folder.cabinetId];
      folderCabinet.folderIds.push(folder.id);
      return {
        ...state,
        folders: {
          ...state.folders,
          editingFolderId: null,
          newFolderInCabinetId: null,
          loading: false,
          error: null,
          byId: {
            ...state.folders.byId,
            [folder.id]: folder
          }
        },
        cabinets: {
          ...state.cabinets,
          byId: { ...state.cabinets.byId, [folder.cabinetId]: folderCabinet }
        }
      };

    case ActionTypes.REMOVE_FOLDER_SUCCESS:
      delete state.folders.byId[action.folder.id];
      const i = state.cabinets.byId[action.folder.cabinetId].folderIds.indexOf(
        action.folder.id
      );
      state.cabinets.byId[action.folder.cabinetId].folderIds.splice(i, 1);
      return {
        ...state
      };

    // FIXME: handle failed folder removal

    default:
      return state;
  }
};
export default rootReducer;
