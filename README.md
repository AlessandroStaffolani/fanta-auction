# Fanta Auction
Project to help to play fanta soccer auction.

This project provides a react JS client that allow to register and than to log in into the application. 
All the clients after thei log in open a socket connection with the server. These socket are used to share a countdown and allow the clients
to reserve them by tapping a simple button.

The client application allow only to the admin to enter into the admin panel, where He could:
- see who are connected
- start and reset the countdown
- add the current player auction
- see the first player who reserve the current player

## Structure
The project is composed by two sub project, `server`and `client`. They have got standlalone `package.json` with standalone dependencies.

## Prerequisites
To run this project you need somewhere a mongoDB database 

## Installation
Run the fanta-auction project you need to clone this repo:

`git clone https://github.com/ale8193/fanta-auction.git`

Than you've to install npm dependencies on server and client folder:

```
cd server
yarn install
cd ..
cd client
yarn install
```
## Configuration
In `server` folder you have to setup `.env` file. You'll found `.env.sample` that explain to you what you need to set up:
- json web token secret
- admin password

In `server` and `client` project you also have to set up some configuration for development and production, you've to put
this configuration inside `config` folder, where you'll find these files: `development.json.sample`and `production.json.sample`,
that tells you wich config you need.

These config files includes database path connection and some security settings, such as password hash config.

## Run
To run the project you need to start the server:
```
cd server
yarn server
```
than the client in an other process:
```
cd client
yarn start
```

## Authors
- Alessandro Staffolani \- *github: ale8193*

## License
This project is licensed under the MIT License - see the [LICENSE.md(https://github.com/ale8193/license.md)] file for details
