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
      associatedFolderId: null,
      description: null,
      specimenIds: []
    }
  },
  search: {
    active: false,
    loading: false,
    error: null,
    history: []
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
      // convert specimens returned into a list by id
      let searchResultList = [];
      let newSpecimenList = { ...state.specimens.byId };
      action.response.docs.forEach(doc => {
        searchResultList.push(doc.id);
        newSpecimenList[doc.id] = doc;
      });
      return {
        ...state,
        specimens: {
          ...state.specimens,
          loading: false,
          byId: newSpecimenList,
          browser: {
            specimenIds: searchResultList,
            loading: false,
            error: null
          }
        },
        search: {
          ...state.search,
          history: [action.response, ...state.search.history]
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
    case ActionTypes.WORKBENCH_ADD_SPECIMEN:
      state.specimens.workbench.specimenIds.push(action.specimenId);
      // de duplicate
      state.specimens.workbench.specimenIds = [
        ...new Set(state.specimens.workbench.specimenIds)
      ];
      return { ...state };

    case ActionTypes.WORKBENCH_REMOVE_SPECIMEN:
      state.specimens.workbench.specimenIds = state.specimens.workbench.specimenIds.filter(
        id => {
          return id !== action.specimenId;
        }
      );
      if (state.specimens.browser.associatedFolderId === "Workbench") {
        state.specimens.browser.specimenIds = [
          ...state.specimens.workbench.specimenIds
        ];
      }
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
        },
        specimens: {
          ...state.specimens,
          byId: { ...action.payload.specimens.byId }
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
          },
          search: {
            ...state.search,
            active: false
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
      if (action.targetType === FocusTargetTypes.SEARCH) {
        return {
          ...state,
          folders: {
            ...state.folders,
            focussedFolderId: null
          },
          search: {
            ...state.search,
            active: true
          },
          specimens: {
            ...state.specimens,
            browser: {
              ...state.specimens.browser,
              associatedFolderId: null,
              specimenIds: [],
              description: null,
              title: null
            }
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

    case ActionTypes.FOLDER_ADD_SPECIMEN_SUCCESS:
      // we just replace the whole folder with a new one
      return {
        ...state,
        folders: {
          ...state.folders,
          byId: { ...state.folders.byId, [action.folder.id]: action.folder }
        }
      };

    case ActionTypes.FOLDER_REMOVE_SPECIMEN_SUCCESS:
      // we just replace the whole folder with a new one
      return {
        ...state,
        folders: {
          ...state.folders,
          byId: { ...state.folders.byId, [action.folder.id]: action.folder }
        },
        specimens: {
          ...state.specimens,
          browser: {
            ...state.specimens.browser,
            specimenIds: action.folder.specimenIds
          }
        }
      };

    default:
      return state;
  }
};
export default rootReducer;
