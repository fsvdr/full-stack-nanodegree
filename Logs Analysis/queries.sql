-- Number of views of each article with each article's author's id
create view views_per_article as
  select articles.title, articles.author, count(*) as views
  from articles join log
  on log.path like '%' || articles.slug
  group by articles.title, articles.author
  order by views desc;

-- What are the most popular three articles of all time?

select title, views
from views_per_article
limit 3;

-- Who are the most popular article authors of all time?

select authors.name, sum(views) as views
from views_per_article join authors
on views_per_article.author = authors.id
group by authors.name
order by views desc;

-- On which days did more than 1% of requests lead to errors?

-- Number of requests per day
create view requests as
  select date(time) as day, count(*) as counter
  from log
  group by day
  order by counter desc;

-- Number of bad requests per day
create view bad_requests as
  select date(time) as day, count(*) as counter
  from log
  where status = '404 NOT FOUND'
  group by day
  order by day desc;

select requests.day, round(cast(
  bad_requests.counter * 100 / requests.counter::float as numeric), 1)
  as percentage
from requests join bad_requests
on requests.day = bad_requests.day
group by requests.day, bad_requests.counter, requests.counter
having round(cast(
  bad_requests.counter * 100 / requests.counter::float as numeric), 1) > 1
order by percentage desc;
