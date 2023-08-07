import { API_URL, API_KEY, RES_PER_PAGE } from './config';
import { getJSON } from './helpers';

// all the data we need for the app are stored in the state
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerpage: RES_PER_PAGE,
  },
  bookmark: [],
};

export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}${id}`);

    // we have receipe as the object name hence we destructure
    // let recipe = data.data.recipe;
    const { recipe } = data.data;
    // we then reformat the data gotten from the API
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      cookingTime: recipe.cooking_time,
    };

    if (state.bookmark.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    console.error(`${err} 😢`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`);
    console.log(data);

    const { recipes } = data.data;
    state.search.results = recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 😢`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerpage; // 0;
  const end = page * state.search.resultsPerpage; // 9;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQty = oldQty * newServings / oldServings // 2 * 8 / 4 = 4
  });

  state.recipe.servings = newServings;
};

// Persist a bookmark
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmark));
};

// adding bookmark
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmark.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmark.findIndex(el => el.id === id);
  state.bookmark.splice(index, 1);

  // Mark current recipe as NOT bookmarked anymore
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmark = JSON.parse(storage); // parse to CONVERT the string back to an OBJECT
};
init();

// for dev purpose only
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();
