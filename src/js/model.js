import { API_URL, API_KEY, RES_PER_PAGE } from './config';
// import { sendJSON, getJSON } from './helpers';
import { AJAX } from './helpers';

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

const createRecipeObject = function (data) {
  // we have receipe as the object name hence we destructure
  // let recipe = data.data.recipe;
  const { recipe } = data.data;
  // we then reformat the data gotten from the API
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && { key: recipe.key }), // we short circuit and spread the data if recipe.key exists then {key: recipe. key} will run. Else, we leave as so. We could have just written key: recipe.key. A VERY NICE TRICK TO CONDITIONALLY ADD PROPERTIES TO AN OBJECT
  };
};
/**
 * Load recipe with AJAX function created. Also updates the bookmark
 * @param {#hash} id 
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

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
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    console.log(data);

    const { recipes } = data.data;
    state.search.results = recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
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

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim);
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);
    // this sends the recipe back to us as data hence, storing it
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
