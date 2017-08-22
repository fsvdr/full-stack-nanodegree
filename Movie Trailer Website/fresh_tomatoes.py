import webbrowser
import os
import re

# String template of the website's head
main_page_head = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>nando's favorites</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://fonts.googleapis.com/css?family=Alfa+Slab+One|Zilla+Slab+Highlight" rel="stylesheet">

    <link href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css" rel="stylesheet"/>
    <style type="text/css">
      .app-header,.app-navigation{position:fixed;left:1.5rem;z-index:1}html{box-sizing:border-box}*,::after,::before{box-sizing:inherit}body{font:normal 400 16px/1.6 "-apple-system",system-ui,BlinkMacSystemFont,"Segoe UI",Tahoma,Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;color:rgba(0,0,0,.87);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-smoothing:antialiased}.o-grid{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:start;-ms-flex-pack:start;justify-content:flex-start;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;-ms-flex-line-pack:start;align-content:flex-start;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-flow:row wrap;flex-flow:row wrap}.o-grid__child{-webkit-box-flex:0;-ms-flex:0 1 auto;flex:0 1 auto}button{padding:0;border:0;background-color:transparent;font-size:inherit;color:inherit;cursor:pointer;outline:0}.app-logo,.app-navigation__btn{font-family:'Alfa Slab One',cursive;color:#01d277}.app-header{top:1.5rem}.app-logo{letter-spacing:1px;font-size:1rem;line-height:0}.app-logo span{font-size:1.4rem}.app-navigation{bottom:1.5rem}.app-navigation__btn{font-size:.875em;width:5rem;padding:.5rem 0;text-align:center;border:2px solid #01d277;transition:all .3s}.app-navigation__btn:hover{background-color:#01d277;color:#fff}.c-movie-container{width:100vw;height:100vh}.c-movie-container__details,.c-movie-container__posters{height:100%}.c-movie-container__posters{width:100%;height:35vh;overflow:hidden;background-color:#000}.c-movie-container__details{position:relative;width:100%;min-height:65vh;background-color:#000;color:#fff}.c-details-list,.c-poster-list{position:relative;width:100%;height:100%}.c-poster-list::after{content:'';position:absolute;display:block;top:0;right:0;bottom:0;left:0;-webkit-box-shadow:inset 0 0 0 9999px rgba(0,0,0,.74);box-shadow:inset 0 0 0 9999px rgba(0,0,0,.74)}.c-details-list__item,.c-poster-list__item{position:absolute;top:0;right:0;bottom:0;left:0;opacity:0;visibility:hidden;transition:all .3s}.c-poster-list__item{width:100%;height:100%;object-fit:cover}.c-details-list__item{padding:1rem 2rem;overflow-y:scroll}.c-details-list__item.is-active,.c-poster-list__item.is-active{opacity:1;visibility:visible}.o-movie-release{font-size:.875rem;color:rgba(255,255,255,.5)}.o-movie-release span{margin-right:1rem}.o-movie-storyline{font-size:.875rem;color:rgba(255,255,255,.7)}.o-movie-trailer{margin-top:5rem;position:relative;padding-bottom:56.25%;padding-top:25px;height:0;max-width:600px;margin-left:auto;margin-right:auto}.o-movie-trailer__title{font-size:.75em;position:relative;bottom:5rem;background-color:rgba(255,255,255,.12);padding:.5rem 1rem;display:inline-block;border-radius:4px;color:rgba(255,255,255,.7)}.o-movie-trailer__video{position:absolute;top:0;left:0;width:100%;height:100%}@media screen and (min-width:769px){.c-movie-container__details,.c-movie-container__posters{height:100%}.c-details-list__item{padding:1rem 2rem}.u-5of12\@lap{width:calc(100% / 12 * 5)}.u-7of12\@lap{width:calc(100% / 12 * 7)}}
    </style>
</head>
'''

# String template for the website's content
main_page_content = '''
<body>
<header class="app-header">
  <sapan class="app-logo">nando's <br><span>favorites<span><span>
</header>
<nav class="app-navigation">
  <button class="app-navigation__btn" onclick="showPrevious()">Prev</button>
  <button class="app-navigation__btn" onclick="showNext()">Next</button>
</nav>
<div class="c-movie-container o-grid">
  <div class="c-movie-container__posters o-grid__child u-5of12@lap">
    <div class="c-poster-list">
      {movie_posters}
    </div>
  </div>
  <div class="c-movie-container__details o-grid__child u-7of12@lap">
    <div class="c-details-list">
      {movie_details}
    </div>
  </div>
</div>
</body>
</html>
'''

# String template of the website's scripting
main_page_script = '''
<script type="text/javascript" charset="utf-8">
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
      if (activeMovieIndex < moviesCount - 1) {
        _removeActiveMovie();

        activeMovieIndex++;
        _initActiveMovie();
      }
    };

    _initActiveMovie();
</script>
'''

# String template for the movie posters
movie_poster_template = '''
<img src="{movie_poster_path}" class="c-poster-list__item" alt="Movie poster"/>
'''

# String template for the movie details
movie_details_template = '''
<div class="c-details-list__item">
    <h1 class="o-movie-title">{movie_title}</h1>
    <div class="o-movie-release">
        <span>{movie_duration}</span>
        <span>{movie_release_year}</span>
        <span>{movie_director}</span>
        <span>{movie_genres}</span>
    </div>
    <p class="o-movie-storyline">{movie_storyline}</p>
    <div class="o-movie-trailer">
        <h2 class="o-movie-trailer__title">Movie trailer</h2>
        <iframe class="o-movie-trailer__video" src="http://www.youtube.com/embed/{movie_trailer_path}" frameborder="0" allowfullscreen></iframe>
    </div>
</div>
'''


def create_movie_details(movies):
    '''
    Create a movie details component for each movie provided
    using the movie_details_template.

    movies: array. Movie ojects with the required information
    '''

    content = ''
    for movie in movies:
        # Extract the youtube ID from the url
        youtube_id_match = re.search(r'(?<=v=)[^&#]+', movie.trailer_path)
        youtube_id_match = youtube_id_match or re.search(
            r'(?<=be/)[^&#]+', movie.trailer_path)
        trailer_youtube_id = (
            youtube_id_match.group(0) if youtube_id_match
            else None)

        content += movie_details_template.format(
            movie_title=movie.title,
            movie_duration=movie.duration,
            movie_release_year=movie.release_date,
            movie_director=movie.director,
            movie_genres=movie.genres,
            movie_storyline=movie.storyline,
            movie_trailer_path=trailer_youtube_id)
    return content


def create_movie_posters(movies):
    '''
    Create a movie poster component for each movie provided
    using the movie_poster_template.

    movies: array. Movie objects with the required information
    '''
    content = ''
    for movie in movies:
        content += movie_poster_template.format(
            movie_poster_path=movie.poster_path)
    return content


def open_movies_page(movies):
    '''
    Write the website file with the provided movies data and
    opens the website in the browser.

    movies: array. Movie objects with the required information
    '''

    # Create or overwrite the output file
    output_file = open('fresh_tomatoes.html', 'w')

    # Replace the movie tiles placeholder generated content
    rendered_content = main_page_content.format(
        movie_posters=create_movie_posters(movies),
        movie_details=create_movie_details(movies))

    # Output the file
    output_file.write(main_page_head + rendered_content + main_page_script)
    output_file.close()

    # open the output file in the browser (in a new tab, if possible)
    url = os.path.abspath(output_file.name)
    webbrowser.open('file://' + url, new=2)
