import { API_URL } from './config';
import { getJSON } from './helpers';

export const state = {
  recipe: {},
};

export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}`);

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
  }
};
