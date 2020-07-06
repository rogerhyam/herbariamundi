import ActionTypes from "../actions/actionTypes";

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
      description: null,
      specimenIds: []
    },
    modalSpecimen: false
  },
  search: {
    active: true,
    loading: false,
    error: null,
    total: 0,
    pageSize: 50,
    lastSearchParams: null,
    current: {
      text: null,
      offset: 0,
      facets: {
        family_ss: null,
        genus_ss: null,
        specific_epithet_ss: null,
        country_code_ss: null,
        year_i: null
      }
    },
    facetTerms: {
      family_ss: null,
      genus_ss: null,
      species_ss: null,
      country_code_ss: null,
      year_i: null
    },
    history: []
  },
  tags: {
    forSpecimenId: null,
    ownTags: [],
    othersTags: [],
    loading: false
  }
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {

    case ActionTypes.SEARCH_FACET_CHANGE:
      let oldSearch = state.search.current;
      return {
        ...state,
        search: {
          ...state.search,
          current: {
            ...state.search.current,
            facets: {
              ...state.search.current.facets,
              [action.facetName]: action.facetValue
            }
          },
          history: [oldSearch, ...state.search.history]
        }
      };

    case ActionTypes.SEARCH_TEXT_CHANGE:
      return {
        ...state,
        search: {
          ...state.search,
          current: {
            ...state.search.current,
            text: action.newText
          },
          history: [state.search.current, ...state.search.history]
        }
      };

    case ActionTypes.SEARCH_OFFSET_CHANGE:
      return {
        ...state,
        search: {
          ...state.search,
          current: {
            ...state.search.current,
            offset: action.newOffset
          },
          history: [state.search.current, ...state.search.history]
        }
      };

    case ActionTypes.SEARCH_RESET:
      return {
        ...state,
        search: {
          ...state.search,
          current: {
            ...initialState.search.current
          },
          facetTerms: {
            ...initialState.search.facetTerms
          },
          history: [state.search.current, ...state.search.history]
        }
      };

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
        },
        search: {
          ...state.search,
          lastSearchParams: { ...action.searchParams }
        }
      };
    case ActionTypes.FETCH_SPECIMENS_SUCCESS:
      // convert specimens returned into a list by id
      console.log(action.fullResponse);
      let searchResultList = [];
      let newSpecimenList = { ...state.specimens.byId };
      action.fullResponse.response.docs.forEach(doc => {
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
          total: action.fullResponse.response.numFound,
          facetTerms: { ...action.fullResponse.facets }
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
      return { ...state };

    case ActionTypes.SHOW_SPECIMENS:
      state.specimens.browser = { ...state.specimens.browser, ...action };
      delete state.specimens.browser.type;
      return { ...state };

    case ActionTypes.SHOW_SPECIMEN_MODAL:
      state.specimens.modalSpecimen = action.modalSpecimen;
      return { ...state };

    // SAVE_TAG actions
    case ActionTypes.SAVE_TAG_BEGIN:
    case ActionTypes.DELETE_TAG_BEGIN:
    case ActionTypes.FETCH_TAGS_BEGIN:
      return {
        ...state,
        tags: {
          ...state.tags,
          forSpecimenId: action.specimenId,
          ownTags: [],
          othersTags: [],
          loading: true,
          error: false,
        }
      };
    case ActionTypes.SAVE_TAG_SUCCESS:
    case ActionTypes.DELETE_TAG_SUCCESS:
      return {
        ...state,
        tags: {
          ...state.tags,
          forSpecimenId: action.fullResponse.specimenId,
          ownTags: action.fullResponse.tags.ownTags,
          othersTags: action.fullResponse.tags.othersTags,
          loading: false,
          error: false
        }
      };
    case ActionTypes.SAVE_TAG_FAILURE:
    case ActionTypes.FETCH_TAGS_FAILURE:
    case ActionTypes.DELETE_TAG_FAILURE:
      return {
        ...state,
        tags: {
          ...state.tags,
          forSpecimenId: [],
          ownTags: [],
          othersTags: [],
          loading: false,
          error: action.payload.error
        }
      };

    // FETCH TAGS
    case ActionTypes.FETCH_TAGS_SUCCESS:
      return {
        ...state,
        tags: {
          ...state.tags,
          forSpecimenId: action.fullResponse.fetched.specimenId,
          ownTags: action.fullResponse.tags.ownTags,
          othersTags: action.fullResponse.tags.othersTags,
          loading: false,
          error: false
        }
      };


    default:
      return state;
  }
};
export default rootReducer;
