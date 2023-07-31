import { API_URL, API_KEY } from './config';
import { getJSON } from './helpers';

// all the data we need for the app are stored in the state
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
  },
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
  } catch (err) {
    console.error(`${err} 😢`);
    throw err;
  }
};
