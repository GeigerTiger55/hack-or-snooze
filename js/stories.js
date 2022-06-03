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
  //console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let favHidden = '';
  let starClass = 'far';
  //console.log("currentUser", currentUser);
  //console.log("currentUser.username", currentUser.username);
  if (currentUser !== undefined) {
    //Check if story is in favorites array and make star filled in if it is
    const checkForFav = currentUser.favorites.filter(favStory => story.storyId === favStory.storyId);

    if (checkForFav.length > 0) {
      starClass = "fas";
    }

  } else {
    favHidden = 'hidden';
  }

  return $(`
      <li id="${story.storyId}">
        <i class="story-favorite ${starClass} fa-star ${favHidden}"></i>
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

/** Uses currentUsers favorite stories array to generate HTML of favorie stories
 * list, and puts on page. */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

/**When user submits the form, add story to the stories list */
async function getInputsAndAddStory(evt) {
  console.debug("getInputsAndAddStory");
  evt.preventDefault();
    const author = $("#author-input").val();
    const title = $("#title-input").val();
    const url = $("#url-input").val();
    try{
      const tryUrl = new URL (url);
    } catch (err){
      alert("URL NOT VALID! Please enter a valid URL!");
      return null;
    }
    
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
function addNewStoryOnPage(newStory) {
  console.debug("addNewStoryOnPage");
  const storyHTML = generateStoryMarkup(newStory);
  $allStoriesList.prepend(storyHTML);
}


/** handler for clicking on favorites icon */
async function handlerforFavorites(evt) {
  console.debug("handlerforFavorites");
  evt.preventDefault();

  const $storyListItem = $(this).closest("li");
  //console.log('storyListItem - fav', storyListItem.data("favorited"));

  updateUIFavorite($(this));
  await updateUserFavoriteList($(this));

}

$allStoriesList.on("click", ".story-favorite", handlerforFavorites);
$favoriteStoriesList.on("click", ".story-favorite", handlerforFavorites);

/**Update UI display and data to reflect that the story has been unfavorited 
 * or favorited
 * 
 * - starIcon is star on LI to toggle
 * - storyFav is if the story is currently a favorite or not * 
 * 
 */
function updateUIFavorite($starIcon) {
  console.debug("updateUIFavorites");
  //Toggle star color
  $starIcon.toggleClass("far fas");
}


/**
 * updateFavoritesList
 * remove or add story to favorites
 * 
 * get storyID from LI
 * use storyID to check if in the favorite list
 *  if not in the favorite list, get the story instance from storyList and add to the favorite list
 *  if in the favorite list, remove story from favoritesList
 * 
 */


async function updateUserFavoriteList($starIcon) {
  console.debug("updateUserFavoriteList");

  const storyId = $starIcon.closest("li").attr("id");
  const storyFavArray = currentUser.favorites.filter(favStory => storyId === favStory.storyId);

  if (storyFavArray.length > 0) {

    let story = storyFavArray[0];
    await currentUser.unfavoriteStory(story);

  } else {

    const storyListArray = storyList.stories.filter(favStory => storyId === favStory.storyId);
    let story = storyListArray[0];
    await currentUser.favoriteStory(story);

  }
  /*
    //Check If solid
    if ($starIcon.hasClass("fas")) {
      await currentUser.favoriteStory(story);
    } else {
      await currentUser.unfavoriteStory(story);
    }
    */
}

