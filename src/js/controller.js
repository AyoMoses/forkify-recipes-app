import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; // polyfill other js codes for old browsers
import 'regenerator-runtime/runtime'; // polyfill asyn/await

// hot module replacement
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  // loading recipe
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    // render spinner
    recipeView.renderSpinner();

    // (1) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // (2) Updating bookmarks view
    bookmarksView.update(model.state.bookmark);

    // (3) load recipe from model - since loadrecipe returns a promise, we need to await before moving on in the codebase
    await model.loadRecipe(id);

    // (4) rendring recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 0.5 Render spinner
    resultsView.renderSpinner();

    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Load search results
    await model.loadSearchResults(query);

    // 3. Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// handle pagination events
const controlPagination = function (goToPage) {
  // 1. Render NEW results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render NEW pagination button
  paginationView.render(model.state.search);
};

// handle servings
const controlServings = function (newServings) {
  // Update the recipe servings (in the state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  // 3. Render the bookmark
  bookmarksView.render(model.state.bookmark);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmark);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show spinner for user
    addRecipeView.renderSpinner();

    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmark);

    // Change ID in the URL
    // the history API is usefull for moving back and forth a page or changing url without refreshing
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back(); 

    // Close form modal
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000); // times 1k to convert it to miliseconds
  } catch (err) {
    console.log('😩', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function() {
  console.log('Welcome to the application! 😎');
}

// the publisher subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
// listen for hashchange event

// instead of having loads of event listeners to do one thing we can have it in an array and loop over
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
///////////////////////////////////////
