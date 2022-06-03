"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const checkForFav = currentUser.favorites.filter(favStory => story.storyId === favStory.storyId);
  let favorite = false;
  let starClass = "far"
  if(checkForFav.length > 0){
    favorite = true;
    starClass = "fas";
  }
  return $(`
      <li data-favorited="${favorite}" id="${story.storyId}">
        <i class="story-favorite ${starClass} fa-star hidden"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**When user submits the form, add story to the stories list */
async function getInputsAndAddStory(evt) {
  console.debug("getInputsAndAddStory");
  evt.preventDefault();
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();
  const storyInfo = {
    author,
    title,
    url,
  };

  const newStory = await storyList.addStory(currentUser, storyInfo);
  addNewStoryOnPage(newStory);

  //Clear form and hide
  $submitForm.trigger("reset");
  $submitForm.hide();
  $(".story-favorite").show();
}

$submitForm.on("submit", getInputsAndAddStory);

/**Add new story submitted by user to page */
function addNewStoryOnPage(newStory){
  console.debug("addNewStoryOnPage");
  const storyHTML = generateStoryMarkup(newStory);
  $allStoriesList.prepend(storyHTML);
}


/** handler for favorites */
function handlerforFavorites(evt){
  console.debug("handlerforFavorites");
  evt.preventDefault();
  const storyListItem = $(this).closet("li");
/*
  if (storyListItem.data("favorited")){
    currentUser.unfavoriteStory(storyListItem.)
  }*/
  
}

$allStoriesList.on("click", ".story-favorite", handlerforFavorites);

/*
updateUIFunc
$(this).toggleClass("far fas");


updateFavoritesList
//remove or add story to favorites
//gets stories from stories list*/

