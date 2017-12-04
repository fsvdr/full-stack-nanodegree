# Logs Analysis

An internal reporting tool for a newspaper site.
Given a database with a set of logs from the website, the program (a command line program) connects to this database and analyses the data in order to respond some questions.

## Requirements
In order to use this project you need to have PostgreSQL installed in you system as well as some basic understanding on how to use it.
You also need to have Python installed as well as the psycopg2 library.

## Installation
1. Clone or download the project folder into your system.
2. Create the news database and initialize it with the provided SQL file.
  *This step assumes you have access to the postgres default user. If you don't or you want to use another user be sure to replace the postgres user in the `newsdata.sql` file, the good old find and replace will work.*

  Inside the project's folder run the following command to **create** the database:
  ```
  sudo -u postgres createdb news
  ```

  Then **initialize** the database:
  ```
  sudo -u postgres psql news -f newsdata.sql
  ```
3. Create the necessary views in the database.

  Connect to the database:
  ```
  psql news
  ```

  Create the `views_per_article` view:
  ```
  create view views_per_article as
    select articles.title, articles.author, count(*) as views
    from articles join log
    on log.path like '%' || articles.slug
    group by articles.title, articles.author
    order by views desc;
  ```

  Create the `requests_per_day` view:
  ```
  create view requests as
    select date(time) as day, count(*) as counter
    from log
    group by day
    order by counter desc;
  ```

  Create the `bad_requests_per_day` view:
  ```
  create view bad_requests as
    select date(time) as day, count(*) as counter
    from log
    where status = '404 NOT FOUND'
    group by day
    order by day desc;
  ```

## Usage
Exit the psql connection or open another terminal and run the Python program:

```
python3 logs-analysis.py
```

## Output
The following is the expected output of the program:

```
============================================================
What are the most popular three articles of all time?
============================================================
"Candidate is jerk, alleges rival" - 338647 views
"Bears love berries, alleges bear" - 253801 views
"Bad things gone, say good people" - 170098 views

============================================================
Who are the most popular article authors of all time?
============================================================
Ursula La Multa - 507594 views
Rudolf von Treppenwitz - 423457 views
Anonymous Contributor - 170098 views
Markoff Chaney - 84557 views

============================================================
On which days did more than 1% of requests lead to errors?
============================================================
Jul 17, 2016 - 2.3% errors

```
