#!/usr/bin/env python3
#
# An internal reporting tool for a newspaper site.

import psycopg2


def get_query_results(query):
    # Connect to an existing database
    db = psycopg2.connect(database="news")

    # Open a cursor to perform database operations
    c = db.cursor()

    # Execute a command
    c.execute(query)

    # Obtain data as Python objects
    result = c.fetchall()

    # Close communication with the database
    db.close()
    return result


def getPopularArticles():
    """Returns five articles from the database"""
    rows = get_query_results("""
        select title, views
        from views_per_article
        limit 3;
        """)

    return rows


def getPopularAuthors():
    """Returns five articles from the database"""
    rows = get_query_results("""
        select authors.name, sum(views) as views
        from views_per_article join authors
        on views_per_article.author = authors.id
        group by authors.name
        order by views desc;
        """)

    return rows


def getErrorDays():
    """Returns five articles from the database"""
    rows = get_query_results("""
        select requests.day, round(cast(
          bad_requests.counter * 100 / requests.counter::float as numeric), 1)
          as percentage
        from requests join bad_requests
        on requests.day = bad_requests.day
        where round(cast(
          bad_requests.counter * 100 / requests.counter::float as numeric), 1)
          > 1
        group by requests.day, bad_requests.counter, requests.counter
        order by percentage desc;
        """)

    return rows


print("\n============================================================")
print("What are the most popular three articles of all time?")
print("============================================================")
for article in getPopularArticles():
    print('"{}" - {} views'.format(article[0], article[1]))

print("\n============================================================")
print("Who are the most popular article authors of all time?")
print("============================================================")
for author in getPopularAuthors():
    print("{} - {} views".format(author[0], author[1]))

print("\n============================================================")
print("On which days did more than 1% of requests lead to errors?")
print("============================================================")
for date in getErrorDays():
    pretty_date = date[0].strftime("%b %d, %Y")
    print("{} - {}% errors".format(pretty_date, date[1]))
