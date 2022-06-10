# RSS-reader-server

Nodejs REST API server which works with Mongodb as DB to fetch RSS sources, and users can save their subscriptions and comment on the news.

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:5005](http://localhost:5005) REST API acces.

## Routes

In ./routes/

### `auth.routes.js`
### `feed.routes.js`
### `user.routes.js`

## Utilities

In ./utilities/

### `updateFeeds.js`

Uses an XML Parser to download the news from our RSS Sources.

## Client
[RSS-Reader-client](https://github.com/jferran/RSS-reader-client)

# RSS-reader-server
