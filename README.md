# 2406 RESTaurant

Final assignment for the COMP 2406 Section B course of Fall 2021. A RESTful
restaurant web app with session support, powered by MongoDB.

## Dependencies

### Node Dependencies

- [express](https://www.npmjs.com/package/express)
- [express-session](https://www.npmjs.com/package/express-session)
- [mongodb](https://www.npmjs.com/package/mongodb)
- [connect-mongodb-session](https://www.npmjs.com/package/connect-mongodb-session)
- [pug](https://www.npmjs.com/package/pug)

Additionally, a MongoDB instance must be running on the machine. Alternatively,
the project can be run in a Docker container; necessary Docker files are supplied.

## Installation

First, clone the repository. The project can be run locally, or in a Docker container.

```bash
git clone https://github.com/willKip/2406-RESTaurant

cd 2406-RESTaurant
```

### Local Machine

A MongoDB daemon must be running in the background.

```bash
npm install

npm run start
# Alternatively, if you want to preserve the DB after initialization,
# try "npm run initdb" followed by "node server.js", or simply the latter if
# a valid project DB has been initialized.
```

Connect to http://localhost:3000 as prompted.

### Docker Container

The project has been Dockerized as an exercise, apart from project
requirements. It will require the [node](https://hub.docker.com/_/node/) and [mongo](https://hub.docker.com/_/mongo) images.

```bash
docker-compose up
```

This will initialize a MongoDB database and run the assignment server.
Connect to http://localhost:3000 normally.

## Usage and Testing

The server will offer a barebones restaurant page. You may log in as any of the
given users (all users are public by default; the user list lists the default users,
who have the same password as their usernames) or create and save your own account
to the database. Most functionality should be self-explanatory; more in-depth
explanation is provided in the [old README](OLD-README.txt) and the 
[assignment specifications](COMP2406-F21-A4%20Specification.pdf). 

## Credits

The assignment specifications and base code are the property of the course
instructor, [Dave McKenney](http://davemckenney.ca), the rest of the
implementation coded by me. The assignment was permitted to be posted publicly;
this repository has its purpose in education and documentation.
