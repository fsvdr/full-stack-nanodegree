import media
import fresh_tomatoes

# Create multiple instances of movies to populate the website
interstellar = media.Movie(
    'Interstellar',
    '2h 49min',
    '2014',
    'Christopher Nolan',
    'Adventure | Drama | Sci-Fi',
    '''
    Earth\'s future has been riddled by disasters, famines, and droughts.
    There is only one way to ensure mankind\'s survival: Interstellar travel.
    A newly discovered wormhole in the far reaches of our solar system allows
    a team of astronauts to go where no man has gone before, a planet that
    may have the right environment to sustain human life.
    ''',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BMjIxNTU4MzY4MF5BMl5BanBnXkFtZTgwMzM4ODI3MjE@._V1_SY1000_CR0,0,640,1000_AL_.jpg',  # noqa
    'https://youtu.be/zSWdZVtXT7E')

the_intern = media.Movie(
    'The Intern',
    '2h 1min',
    '2015',
    'Nancy Meyers',
    'Comedy | Drama',
    '''
    A retired 70-year-old widower, Ben (played by Robert De Niro), is bored
    with retired life. He applies to a be a senior intern at an online
    fashion retailer and gets the position. The founder of the company is
    Jules Ostin (Anne Hathaway), a tireless, driven, demanding, dynamic
    workaholic. Ben is made her intern, but this is a nominal role - she
    doesn\'t intend to give him work and it is just window dressing.
    However, Ben proves to be quite useful and, more than that, a source
    of support and wisdom. Written by grantss
    ''',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BMTUyNjE5NjI5OF5BMl5BanBnXkFtZTgwNzYzMzU3NjE@._V1_SY1000_CR0,0,674,1000_AL_.jpg',  # noqa
    'https://youtu.be/ZU3Xban0Y6A')

# Wrap the movie instances in a single array
movies = [interstellar, the_intern]

# Open movies website with the movies array
fresh_tomatoes.open_movies_page(movies)
