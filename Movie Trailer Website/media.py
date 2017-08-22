# coding=utf-8

'''
Module to display movie object, attributes and instances
'''


class Movie():
    '''
    Class definition for storing movie related information
    '''
    def __init__(self, title, duration, release_date,
                 director, genres, storyline, poster_path, trailer_path):
        '''
        Initialize instance of class Movie
        :param title:
        :param duration:
        :param release_date:
        :param director:
        :param genres:
        :param storyline:
        :param poster_path:
        :param trailer_path:
        '''
        self.title = title
        self.duration = duration
        self.release_date = release_date
        self.director = director
        self.genres = genres
        self.storyline = storyline
        self.poster_path = poster_path
        self.trailer_path = trailer_path
