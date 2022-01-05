F21 COMP2406B Assignment 4

Author
    William Lee
Date
    Nov 23 2021

Files Included
    assignment4
    │   database-initializer.js
    │   server.js
    │   package.json
    │   README.txt
    │
    ├───public
    │       orderform.js
    │       register.js
    │       user.js
    │       add.png
    │       remove.png
    │
    └───views
        ├───pages
        │       error.pug
        │       home.pug
        │       login.pug
        │       order.pug
        │       orderform.pug
        │       register.pug
        │       user.pug
        │       users.pug
        │
        └───partials
                header.pug

Dependencies
    "express"                   web framework
    "express-session"           easy sessions for express servers
    "mongodb"                   Node MongoDB driver
    "connect-mongodb-session"   stores session data in MongoDB databases
    "pug"                       template engine

Instructions
    - In the directory, install dependencies with "npm install".

    - While a MongoDB daemon is running in the background, run "npm run initdb" or
    "node database-initializer.js" to clear the existing "a4" database and add
    10 example users in the "users" collection.

    - Run the server with "npm run start" or "node server.js", and type
    "http://localhost:3000" in a web browser to connect to the application.

    - The application is now available for testing. The application should be
    self-explanatory for the most part. Some notes:
        - Users can be searched by inputting query parameters in the URL manually.
        (e.g. "http://localhost:3000/users?name=eD" will bring up winnifred and
        pedro from the 10 example users, as the query is case-insensitive; although
        note that if winnifred's profile is set to private, the query will show
        only pedro)
        - The header will not display pages unavailable to logged-out users.
        Saving the links and attempting to access them anyway will result in an
        error page with an appropriate status code.
        - The home page simply displays a welcome message.
        - Error pages are generated in Pug, and contain headers like every page
        and a link to return to the home page.

Comments
    - The order form JavaScript is used as-is, storing data client-side. The
    page is rendered with Pug now, in order to incorporate the header easily.

    - The server makes use of res.locals to supply variables to the header Pug
    partial page. The header uses the loggedin boolean and the username stored
    to determine if the header should display items in a "logged in" state or not,
    and if so, displays the current user's username.

    - Session data is stored in the a4 database through "connect-mongodb-session",
    within the "sessions" collection. This makes it so that sessions will persist
    even through server restarts.

    - Order data objects generated from the given orderform.js file are stored
    in the "orders" collection.

    - Users in the database now store an "orderIDs" array with IDs to each order
    they have made, which enables easy looking up of related orders. In turn,
    each order saves an "orderedBy" attribute with the ID of the user who ordered it.

    - URLs taking MongoDB IDs as routes first parse the passed ID to see if it
    is valid, and then proceed to the query. This prevents crashes due to invalid
    URLs that take IDs. It can be demonstrated by taking a valid URL to a user
    or order's page and editing the ID however; this will make the URL lead to
    an error page with a 404 status.

    - Logging in as a user while another session exists with the user logged in
    will cause a 401 error and deny the login attempt. The login will succeed
    when the other session with the user expires or logs out.

Credits
    - connect-mongodb-session documentation for session storage in MongoDB
    - Base code provided as part of assignment by F21 COMP 2406 B
