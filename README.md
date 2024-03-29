1. Open terminal or cmd from inside the repo.
2. Run `npm install` to install all dependencies tracked inside `package.json` file.
   _(Next step is only for running in `localhost`.)_
3. Create a file named `.env` and place `key=value` pair inside it.
   _Example:_
   Inside `.env` file...

```
DB_PATH=value0 | mongodb://localhost:27017/<database_name>
SESSION_SECRET=value1
PORT=value2 | 3001 (dev) | 8080 (deploy)
SERVER_DOMAIN=value3 | http://localhost:3001
MAPBOX_KEY=value5
```

_(Use the same keys with real values.)_

_**Note**: Set `NODE_ENV=PRODUCTION` environment variable in your production environment to allow cross-origin session cookies, i.e. to let client run on a different domain. (While in other environments it is limited to same-site.)_

4. Run `mongoDB` daemon to be able to connect to database.
5. Run `npm start` or `npm run dev` (to use `nodemon` in dev environment).
