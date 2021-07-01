"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodeButton = $(".Show-getEpisodes",);

const TV_MAZE_BASE_URL = "http://api.tvmaze.com";
const MISSING_IMG = "https://tinyurl.com/tv-missing";

// const SHOWS_PER_PAGE = 10;
const EPISODES_PER_CLICK = 10;




/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  
  let response = await axios.get(`${TV_MAZE_BASE_URL}/search/shows`, {params:{q: term}})
  
  return response.data.map(result => (
    {
      id: result.show.id, 
      name: result.show.name, 
      summary: result.show.summary ? result.show.summary : "No summary available", 
      image: result.show.image ? result.show.image.medium : MISSING_IMG
    }
  ))

  // for (let i = 0; i < SHOWS_PER_PAGE; i++) {

  //   if (response.data[i] === undefined){
  //     break;
  //   }

  //   let id = response.data[i].show.id;
  //   let name = response.data[i].show.name;

  //   let summary = response.data[i].show.summary;
  //   if (summary === null) {
  //     summary = "No Summary";
  //   }

  //   let image = response.data[i].show.image;
  //   if (image === null) {
  //     image = MISSING_IMG;
  //   } else {
  //     image = response.data[i].show.image.medium;
  //   }
  //   shows.push({id, name, summary, image});
  // }
  
  // return shows;
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});



/** Adds event handler on show list, with callback function getting episode data and displaying it to the DOM */
$showsList.on("click","button", getAndPopulateEpisodes)

async function getAndPopulateEpisodes(evt) {
  $("#episodesList").empty()
  let id = $(evt.target).closest(".Show").attr("data-show-id");
  let episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

/** Given an array of episodes, create html list elements and append to episodes list. Reveals hidden episode list */
function populateEpisodes(episodes) {
  
  for (let episode of episodes) {
    const $episode = $(
      `<li>
      ${episode.name} (season ${episode.season}, number ${episode.number})
      </li>`
      );
    $("#episodesList").append($episode);
  }
  $episodesArea.show();
}

/** Given a show id, makes an AJAX request to grab episode data and returns an array of objects containing data for each episode */
async function getEpisodesOfShow(id) {  
  let response = await axios.get(`${TV_MAZE_BASE_URL}/shows/${id}/episodes`)
  let episodes = [];
  // response.data.slice --> get array of 10
  // if map index reaches episodes_per_click, stop
  for (let i = 0; i < EPISODES_PER_CLICK; i++) { // rename to MAX_EPISODES
    // break the loop a show has fewer than 10 episodes
    if (response.data[i] === undefined){
      break;
    }
    let {id,name,season,number} = response.data[i];

    // let id = response.data[i].id;
    // let name = response.data[i].name;
    // let season = response.data[i].season;
    // let number = response.data[i].number;
    episodes.push({id, name, season, number});
  }
  return episodes;
}


