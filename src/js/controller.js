import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';

import 'core-js/stable'; // polyfill other js codes for old browsers
import 'regenerator-runtime/runtime'; // polyfill asyn/await
import { async } from 'regenerator-runtime';

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

    // load recipe from model - since loadrecipe returns a promise, we need to await before moving on in the codebase
    await model.loadRecipe(id);

    // (2) rendring recipe
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
  recipeView.render(model.state.recipe);
};

// the publisher subscriber pattern
const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
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
