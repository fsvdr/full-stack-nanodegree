var posterList = document.querySelector('.c-poster-list');
var detailsList = document.querySelector('.c-details-list');

var moviesCount = posterList.children.length;

var activeMovieIndex = 0;
var activeMoviePoster;
var activeMovieDetails;

function _initActiveMovie() {
  activeMoviePoster = posterList.children[activeMovieIndex];
  activeMovieDetails = detailsList.children[activeMovieIndex];

  activeMoviePoster.classList.add('is-active');
  activeMovieDetails.classList.add('is-active');
};

function _removeActiveMovie() {
  activeMoviePoster.classList.remove('is-active');
  activeMovieDetails.classList.remove('is-active');
}

function showPrevious() {
  if (activeMovieIndex > 0) {
    _removeActiveMovie();

    activeMovieIndex--;
    _initActiveMovie();
  }
};

function showNext() {
  if (activeMovieIndex < moviesCount) {
    _removeActiveMovie();

    activeMovieIndex++;
    _initActiveMovie();
  }
};

_initActiveMovie();
