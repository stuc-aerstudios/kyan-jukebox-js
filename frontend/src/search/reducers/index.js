import Constant from 'search/constants'

const initalState = {
  searchSideBarOpen: false,
  query: '',
  limit: 20,
  offset: 0,
  total: 0,
  results: []
}

const search = (state = initalState, action) => {
  switch (action.type) {
    case Constant.REMOVE_FROM_SEARCH_RESULTS:
      return {
        ...state,
        results: state.results.filter(item => {
          return item.track.uri !== action.uri
        })
      }
    case Constant.TOGGLE_SEARCH_SIDEBAR:
      return Object.assign({}, state, {
        searchSideBarOpen: action.open
      })
    case Constant.STORE_SEARCH_QUERY:
      return Object.assign({}, state, {
        query: action.query
      })
    case Constant.STORE_SEARCH_RESULTS:
      const results = action.results.tracks
      return Object.assign({}, state, {
        limit: results.limit,
        offset: results.offset,
        total: results.total > 10000 ? 10000 : results.total,
        results: results.items
      })
    default:
      return state
  }
}

export default search
