[![Netlify Status](https://api.netlify.com/api/v1/badges/5fa4e76c-9b37-4c73-aa71-45a3780bb5ef/deploy-status)](https://app.netlify.com/sites/appointment-routes/deploys)

# apointment-routes

This is a React app that displays appointments and directions between them on a Google Map based on technician data from an external API. This app was built for a client but has been adapted to show dummy data for demonstration purposes.

## Prerequisites

[node](https://nodejs.dev/) >=12.18.0 installed
[yarn]() >=1.22.0 installed

A Google Cloud Platform project with an API key and the following apis enabled:

- Maps Javascript API
- Geocoding API
- Directions API

Follow this guide to create a project and API key: [Create a project and enable the API](https://developers.google.com/workspace/guides/create-project)

## Development

Follow the steps below to run locally.

### Create .env files

1. `/.env`
   Should have the following env vars:

```
PORT=3000
GOOGLE_MAPS_API_KEY={the api key for your Google Cloud Platform project}
```

1. `/client/.env`
   Should have the following env vars:

```
REACT_APP_GOOGLE_MAPS_API_KEY={the api key for your Google Cloud Platform project}
REACT_APP_GOOGLE_MAP_STARTING_LAT={latitude of desired initial center of map on first load}
REACT_APP_GOOGLE_MAP_STARTING_LNG={longitude of desired initial center of map on first load}
REACT_APP_GOOGLE_MAP_STARTING_ZOOM={zoom of desired initial view of map on first load || suggestion: 10}
REACT_APP_USE_NETLIFY_FUNCTIONS={a flag indicating whether or not to use netlify functions for the app's backend (true) or the included express server (false || null)}
REACT_APP_MAX_WAYPOINTS={max number of waypoints the app is allowed to add to a directionsRequest - adding more than 10 waypoints exceeds the Directions API free tier}
```

### Running the app

There are a few different ways to run this app locally. The two suggested ways are:

**The easiest** is to run the Express server to provide access to the Google Directions, and Geocoding APIs and run the React app with a development proxy to the Express server:

1. Make sure `REACT_APP_USE_NETLIFY_FUNCTIONS` is set to `null`, `false`, or not set at all in `/client/.env`
1. Run `yarn run install-all` (installs dependencies for the server and client)
1. Run `yarn start` (runs the server and the client using [concurrently](https://www.npmjs.com/package/concurrently))
1. Visit http://localhost:3000

This is most similar to how the app would be deployed on Heroku or another platform that depended on the Express server to serve the React client.

**To mimic Netlify**

1. Make sure `REACT_APP_USE_NETLIFY_FUNCTIONS` is `true` in `/client/.env`
1. Install the Netlify CLI globally to run a Netlify dev environment locally: `npm install netlify-cli -g`
1. Run `netlify dev`

## Deployment

This app has been configured with flexibility of deployment in mind.

It is ready to be deployed to:

1. [Netlify](https://www.netlify.com/)
   Configuration file: `netlify.toml`
1. [Heroku](https://www.heroku.com/home)
   Configuration file: `Procfile`
1. Any server/VM/container (I have not included a process manager config or init system, however)

## Author

👤 **Kellen Busby**

- Website: https://www.kellenbusbysoftware.com
- Github: [@busbyk](https://github.com/busbyk)
