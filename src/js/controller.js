import * as model from './model.js';
import recipeView from './views/recipeView.js';

import 'core-js/stable'; // polyfill other js codes for old browsers
import 'regenerator-runtime/runtime'; // polyfill asyn/await

const recipeContainer = document.querySelector('.recipe');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// API endpoint
// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  // loading recipe
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;

    // render spinner
    recipeView.renderSpinner();

    // load recipe from model - since loadrecipe returns a promise, we need to await before moving on in the codebase
    await model.loadRecipe(id);

    // (2) rendring recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
  }
};

// the publisher subscriber pattern
const init = function () {
  recipeView.addHandlerRender(controlRecipes);
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
