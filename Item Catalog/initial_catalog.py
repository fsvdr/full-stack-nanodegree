from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database_setup import Base, Category, Item

engine = create_engine('sqlite:///catalog.db')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()

# Create categories
Category1 = Category(name='All', description='List of all the available items')
session.add(Category1)
session.commit()

Category2 = Category(name='Books', description='List all the available books')
session.add(Category2)
session.commit()

Category3 = Category(
    name='Movies', description='List all the available movies')
session.add(Category3)
session.commit()

Category4 = Category(name='Music', description='List all the available albums')
session.add(Category4)
session.commit()

Item1 = Item(
    name='Our Final Invention',
    description='''
        Artificial Intelligence helps choose what books you buy, what movies
        you see, and even who you date.''',
    category_id=2, user_id=1)
session.add(Item1)
session.commit()

Item2 = Item(
    name='The Martian',
    description='''
        The Martian is a 2011 science fiction novel written by Andy Weir.''',
    category_id=2, user_id=2)
session.add(Item2)
session.commit()

Item3 = Item(
    name='Harry Potter',
    description='''
        Harry Potter is a British-American film series based on the Harry
        Potter novels by author J. K. Rowling.''',
    category_id=3, user_id=2)
session.add(Item3)
session.commit()

Item6 = Item(
    name='The Intern',
    description='''
        Seventy-year-old widower Ben Whittaker has discovered that retirement
        isn\'t all it\'s cracked up to be.''',
    category_id=3, user_id=1)
session.add(Item6)
session.commit()

Item4 = Item(
    name='Wild World',
    description='''
        Wild World is Bastille\'s sophomore album and follow up to 2013\'s
        Bad Blood.''',
    category_id=4, user_id=1)
session.add(Item4)
session.commit()

Item5 = Item(
    name='The Boy Who Cried Wolf',
    description='''
        The Boy Who Cried Wolf is the eighth studio album by English
        singer-songwriter Passenger.''',
    category_id=4, user_id=2)
session.add(Item5)
session.commit()
