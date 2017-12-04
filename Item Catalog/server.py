from flask import (
    Flask, render_template, request, redirect, jsonify, url_for, flash)
from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Category, Item, User

from flask import session as login_session
import random
import string
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
from flask import make_response
import requests

app = Flask(__name__)

CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']
APPLICATION_NAME = "Restaurant Menu"

# Connect to Database and create database session
engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


#################################################
# JSON APIs
#################################################
@app.route('/catalog.json')
def catalogJSON():
    categories = session.query(Category)
    cats = []
    for c in categories[1:]:
        items = session.query(Item).filter_by(category_id=c.id)
        cats.append(c.serialize(items=[i.serialize for i in items]))

    return jsonify(Categories=cats)


#################################################
# App Routes
#################################################
@app.route('/')
@app.route('/catalog')
def default():
    """Wildcard route, redirect to catalog at 'All' category"""
    return redirect(url_for('showCatalog', category_name='All'))


@app.route('/catalog/<string:category_name>')
def showCatalog(category_name):
    """Show catalog items for the given category"""
    # Create anti-forgery state token
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in range(32))
    login_session['state'] = state

    user_id = getUserId(login_session.get('email'))

    categories = session.query(Category)
    selection = session.query(Category).filter_by(name=category_name).one()
    if category_name == 'All':
        # Show all items and select the 'All' category
        items = session.query(Item)
        return render_template(
            'catalog.html', categories=categories, selection=selection,
            items=items, state=state, user_id=user_id, CLIENT_ID=CLIENT_ID)
    else:
        # Show only the selected category's items
        items = session.query(Item).filter_by(category_id=selection.id)
        return render_template(
            'catalog.html', categories=categories, selection=selection,
            items=items, state=state, user_id=user_id, CLIENT_ID=CLIENT_ID)


@app.route('/login', methods=['POST'])
def showLogin():
    """Handle authentication logic"""
    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    # Obtain authorization code
    code = request.data

    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = (
        'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={}'
        .format(access_token))
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(
            json.dumps('Current user is already connected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['email'] = data['email']

    user_id = getUserId(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id
    return 'Success'


@app.route('/logout')
def doLogout():
    """Handle de authentication logic"""
    access_token = login_session.get('access_token')
    if access_token is None:
        response = make_response(
            json.dumps('Current user not connected.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    url = 'https://accounts.google.com/o/oauth2/revoke?token={}'.format(
        login_session['access_token'])
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    if result['status'] == '200':
        del login_session['access_token']
        del login_session['gplus_id']
        del login_session['username']
        del login_session['email']
        response = make_response(json.dumps('Successfully disconnected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return redirect(url_for('showCatalog', category_name='All'))
    else:
        response = make_response(
            json.dumps('Failed to revoke token for given user.'), 400)
        response.headers['Content-Type'] = 'application/json'
        return response


@app.route('/catalog/new', methods=['GET', 'POST'])
def newCategoryItem():
    """Present new item form and handle submission"""
    if 'username' not in login_session:
        return redirect(url_for('showCatalog', category_name='All'))
    if request.method == 'POST':
        newItem = Item(
            name=request.form['name'],
            description=request.form['description'],
            category_id=request.form['category'],
            user_id=getUserId(login_session['email']))
        session.add(newItem)
        session.commit()

        # Redirect to item's category for visual confirmation
        category = session.query(Category).filter_by(
            id=int(request.form['category'])).one()
        flash(
            'New item \'{}\' successfully added to {}'.format(
                newItem.name, category.name))
        return redirect(url_for('showCatalog', category_name=category.name))
    else:
        categories = session.query(Category)
        # The 'All' category is presentational, hide it from select options
        return render_template('newitem.html', categories=categories[1:])


@app.route('/catalog/<int:item_id>/edit', methods=['GET', 'POST'])
def editCategoryItem(item_id):
    """Present edit item form and handle submission"""
    if 'username' not in login_session:
        return redirect(url_for('showCatalog', category_name='All'))
    editedItem = session.query(Item).filter_by(id=item_id).one()
    if request.method == 'POST':
        if request.form['name']:
            editedItem.name = request.form['name']
        if request.form['description']:
            editedItem.description = request.form['description']
        if request.form['category']:
            editedItem.category_id = request.form['category']
        session.add(editedItem)
        session.commit()

        # Redirect to item's category for visual confirmation
        category = session.query(Category).filter_by(
            id=editedItem.category_id).one()
        flash(
            'Item \'{}\' successfully updated'.format(editedItem.name))
        return redirect(url_for('showCatalog', category_name=category.name))
    else:
        categories = session.query(Category)
        # The 'All' category is presentational, hide it from select options
        return render_template(
            'edititem.html', categories=categories[1:], item=editedItem)


# Delete given item
@app.route('/catalog/<int:item_id>/delete', methods=['GET', 'POST'])
def deleteCategoryItem(item_id):
    """Present delete form and handle submission"""
    if 'username' not in login_session:
        return redirect(url_for('showCatalog', category_name='All'))
    deleteItem = session.query(Item).filter_by(id=item_id).one()
    category = session.query(Category).filter_by(
        id=deleteItem.category_id).one()

    if request.method == 'POST':
        session.delete(deleteItem)
        session.commit()

        flash(
            'Item \'{}\' in category {} successfuly deleted'.format(
                deleteItem.name, category.name))
        # Redirect to item's category for visual confirmation
        return redirect(url_for(
            'showCatalog', category_name=category.name))
    else:
        return render_template(
            'deleteitem.html', item=deleteItem, category=category)


# User helper functions
def createUser(login_session):
    new_user = User(name=login_session['username'],
                    email=login_session['email'])
    session.add(new_user)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).one()
    return user.id


def getUserInfo(id):
    user = session.query(User).filter_by(id=id).one()
    return user


def getUserId(email):
    try:
        user = session.query(User).filter_by(email=email).one()
        return user.id
    except:
        return None


if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='127.0.0.1', port=5000)
