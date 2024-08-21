
<p  align="center">

<img src="https://img.icons8.com/?size=512&id=55494&format=png" width="100"  />

</p>

<p  align="center">

<h1  align="center">TICTACTOE3D</h1>

</p>

<p  align="center">

<em><code>► INSERT-TEXT-HERE</code></em>

</p>

<p  align="center">

<img src="https://img.shields.io/github/license/devedale/tictactoe3d?style=flat&color=0080ff" alt="license">

<img src="https://img.shields.io/github/last-commit/devedale/tictactoe3d?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">

<img src="https://img.shields.io/github/languages/top/devedale/tictactoe3d?style=flat&color=0080ff" alt="repo-top-language">

<img src="https://img.shields.io/github/languages/count/devedale/tictactoe3d?style=flat&color=0080ff" alt="repo-language-count">

<p>

<p  align="center">

<em>Developed with the software and tools below.</em>

</p>

<p  align="center">

<img src="https://img.shields.io/badge/GNU%20Bash-4EAA25.svg?style=flat&logo=GNU-Bash&logoColor=white" alt="GNU%20Bash">

<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">

<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=flat&logo=Prettier&logoColor=black" alt="Prettier">

<img src="https://img.shields.io/badge/YAML-CB171E.svg?style=flat&logo=YAML&logoColor=white" alt="YAML">

<img src="https://img.shields.io/badge/Sequelize-52B0E7.svg?style=flat&logo=Sequelize&logoColor=white" alt="Sequelize">

<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" alt="ESLint">

<br>

<img src="https://img.shields.io/badge/Puppeteer-40B5A4.svg?style=flat&logo=Puppeteer&logoColor=white" alt="Puppeteer">

<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">

<img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white" alt="Docker">

<img src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" alt="Express">

<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">

</p>

<hr>

  

## Quick Links

  

> - [ Objectives](#-Objectives)

> - [ Features](#-features)

> - [ Repository Structure](#-repository-structure)

> - [ Modules](#-modules)

> - [ Getting Started](#-getting-started)

> - [ Installation](#-installation)

> - [ Running tictactoe3d](#-running-tictactoe3d)

> - [ Tests](#-tests)

> - [ Project Roadmap](#-project-roadmap)

> - [ Contributing](#-contributing)

> - [ License](#-license)

> - [ Acknowledgments](#-acknowledgments)

  

---

  

## Objectives

  

<code>► This project develops a system for managing classic Tic-Tac-Toe and 3D Tic Tac Toe. It provides an interactive gaming experience, allowing authenticated users via JWT to play against each other or the computer. The system supports multiple active games simultaneously, ensuring each user participates in only one game at a time.

</code>

### Requirements translation


| **Functionality**                     | **Description**                                                                                                                                                                                                                                          | **Endpoint**                       | **HTTP Method** | **Authentication**   | **Parameters**                                                 | **Response**                                                                                                                                                   |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-----------------|----------------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Create New Game**                  | Allows creating a new game specifying the opponent's email and game type (classic/3D). The game is charged a token fee based if playing pvp , no charge for play against ai. JWT aut based on users email                                                                          | `/games`                           | `POST`          | JWT                  | `player2Mail`: Opponent's email to play pvp or just 'ai' to play against ai `type`: Game type (2d/3d, the app is designed for play also different size of board after 3x3 for 2d and 4x4x4 for 3d but it is not implemented as controller), `currentPlayer`: This allow to choose if start first or start after challenger | `201 Created`: Game details, `400 Bad Request`: Invalid input or insufficient tokens, `404 Not Found`: User or game type not found                              |
| **Make a Move**                     | Allows a player to make a move in a specified game. It checks if the move is valid and if it is the player's turn.                                                                         | `/games/:id/move`                  | `POST`          | JWT                  | `x`: X-coordinate, `y`: Y-coordinate, `z`: Z-coordinate (if 3D) | `200 OK`: Move details and updated board, `400 Bad Request`: Invalid move or parameters, `403 Forbidden`: Not authorized, `404 Not Found`: Game not found    |
| **Resign from Game**                 | Allows a player to resign from a specified game. The user must be authorized to resign from the game and the game should not be finished.                                                                                                           | `/games/:id/resign`                | `POST`          | JWT                  | None                                                          | `200 OK`: Resignation confirmed, `400 Bad Request`: Invalid game ID or already finished game, `403 Forbidden`: Not authorized to resign                       |
| **Get Game Status**                  | Retrieves the current status of a specified game including players, current player, winner, and board state.                                                                                                                                           | `/games/:id/status`                | `GET`           | JWT                  | None                                                          | `200 OK`: Game status details, `400 Bad Request`: Invalid game ID, `404 Not Found`: Game not found                                                          |
| **Get Game Move History**            | Retrieves the history of moves for a specified game. Can filter by date range and export in JSON or PDF format if requested.                                                                                                                            | `/games/:id/moves`                 | `GET`           | JWT                  | `format`: Export format (json/pdf), `startDate`: Start date, `endDate`: End date | `200 OK`: Move history, `400 Bad Request`: Invalid format or date range, `404 Not Found`: Game not found                                                   |
| **Get Rank List**                    | Retrieves a ranked list of users based on their game performance including wins, losses, and win percentage.                                                                                                                                              | `/rank`                            | `GET`           | JWT                  | None                                                          | `200 OK`: Rank list of users, `404 Not Found`: No users found                                                                                                 |
| **Register User**                    | Registers a new user with an email and password. Checks for valid email format and password length.                                                                                                                                                     | `/users/register`                  | `POST`          | None                 | `email`: User's email, `password`: User's password            | `201 Created`: User registration complete, `400 Bad Request`: Invalid email or password, `409 Conflict`: User already exists                                |
| **Login User**                       | Logs in a user and generates a JWT token. Verifies email and password, and returns a token for authenticated access.                                                                                                                                     | `/users/login`                     | `POST`          | None                 | `email`: User's email, `password`: User's password            | `200 OK`: JWT token, `400 Bad Request`: Invalid email or password                                                                                            
| **Recharge User Tokens**             | Allows an admin to refill tokens for a specific user. Admin authentication is required.                                                                                                                                                                 | `/users/:id/recharge`              | `POST`          | JWT (Admin only)     | `tokens`: Amount of tokens to add                             | `200 OK`: Updated user tokens, `400 Bad Request`: Invalid user ID or token amount, `403 Forbidden`: Not authorized to refill tokens   

### Other Routes

| **Functionality**                     | **Description**                                                                                                                                                                                                                                          | **Endpoint**                       | **HTTP Method** | **Authentication**   | **Parameters**                                                 | **Response**                                                                                                                                                   |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-----------------|----------------------|---------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|                      
| **Get List of Games**                | Retrieves the list of all games.                                                                                                                                                                                                                       | `/games`                           | `GET`           | JWT by users email                  | None                                                          | `200 OK`: List of games, `404 Not Found`: No games found                                                                                                       |
| **Get Users**                        | Retrieves the list of all users.                                                                                                                                                                                                                       | `/users`                           | `GET`           | JWT                  | None                                                          | `200 OK`: List of users, `404 Not Found`: No users found                                                                                                       |
  

---

  

## Features

  

<code>► INSERT-TEXT-HERE</code>

  

---

  

## Repository Structure

  

```sh

└──  tictactoe3d/

├──  LICENSE

├──  README.md

├──  app

│  ├──  .jshintrc

│  ├──  .sequelizerc

│  ├──  Dockerfile

│  ├──  eslint-report.json

│  ├──  eslint.config.mjs

│  ├──  global.d.ts

│  ├──  migrate_seed.sh

│  ├──  package.json

│  ├──  src

│  │  ├──  app.ts

│  │  ├──  database

│  │  │  ├──  cache.ts

│  │  │  ├──  connection.ts

│  │  │  ├──  models

│  │  │  │  ├──  dao.ts

│  │  │  │  ├──  game.ts

│  │  │  │  ├──  index.js

│  │  │  │  ├──  role.ts

│  │  │  │  └──  user.ts

│  │  │  ├──  repository

│  │  │  │  ├──  game.ts

│  │  │  │  ├──  role.ts

│  │  │  │  └──  user.ts

│  │  │  └──  sequelize-cli

│  │  │  ├──  config

│  │  │  ├──  migrations

│  │  │  └──  seeders

│  │  ├──  errors

│  │  │  ├──  AppError.ts

│  │  │  ├──  ErrorFactory.ts

│  │  │  └──  HttpStatusCode.ts

│  │  ├──  index.ts

│  │  ├──  middlewares

│  │  │  ├──  errorHandler.ts

│  │  │  ├──  filterRequest.ts

│  │  │  ├──  jwtAuth.ts

│  │  │  ├──  jwtRS256.key.pub

│  │  │  ├──  logger.ts

│  │  │  └──  methods.ts

│  │  ├──  routes

│  │  │  ├──  game.ts

│  │  │  └──  user.ts

│  │  ├──  routesConfig.ts

│  │  └──  services

│  │  ├──  board.ts

│  │  ├──  export.ts

│  │  ├──  game.ts

│  │  ├──  jwtRS256.key

│  │  └──  user.ts

│  └──  tsconfig.json

├──  db

│  ├──  Dockerfile

│  └──  initdb

│  ├──  init.sh

│  └──  init.sql

├──  docker-compose.yml

└──  start.sh

```

  

---

  

## Modules

  

<details closed><summary>.</summary>

  

| File | Summary |

| --- | --- |

| [docker-compose.yml](https://github.com/devedale/tictactoe3d/blob/master/docker-compose.yml) | <code>► INSERT-TEXT-HERE</code> |

| [start.sh](https://github.com/devedale/tictactoe3d/blob/master/start.sh) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>db</summary>

  

| File | Summary |

| --- | --- |

| [Dockerfile](https://github.com/devedale/tictactoe3d/blob/master/db/Dockerfile) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>db.initdb</summary>

  

| File | Summary |

| --- | --- |

| [init.sql](https://github.com/devedale/tictactoe3d/blob/master/db/initdb/init.sql) | <code>► INSERT-TEXT-HERE</code> |

| [init.sh](https://github.com/devedale/tictactoe3d/blob/master/db/initdb/init.sh) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app</summary>

  

| File | Summary |

| --- | --- |

| [.sequelizerc](https://github.com/devedale/tictactoe3d/blob/master/app/.sequelizerc) | <code>► INSERT-TEXT-HERE</code> |

| [Dockerfile](https://github.com/devedale/tictactoe3d/blob/master/app/Dockerfile) | <code>► INSERT-TEXT-HERE</code> |

| [tsconfig.json](https://github.com/devedale/tictactoe3d/blob/master/app/tsconfig.json) | <code>► INSERT-TEXT-HERE</code> |

| [eslint-report.json](https://github.com/devedale/tictactoe3d/blob/master/app/eslint-report.json) | <code>► INSERT-TEXT-HERE</code> |

| [package.json](https://github.com/devedale/tictactoe3d/blob/master/app/package.json) | <code>► INSERT-TEXT-HERE</code> |

| [migrate_seed.sh](https://github.com/devedale/tictactoe3d/blob/master/app/migrate_seed.sh) | <code>► INSERT-TEXT-HERE</code> |

| [global.d.ts](https://github.com/devedale/tictactoe3d/blob/master/app/global.d.ts) | <code>► INSERT-TEXT-HERE</code> |

| [eslint.config.mjs](https://github.com/devedale/tictactoe3d/blob/master/app/eslint.config.mjs) | <code>► INSERT-TEXT-HERE</code> |

| [.jshintrc](https://github.com/devedale/tictactoe3d/blob/master/app/.jshintrc) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src</summary>

  

| File | Summary |

| --- | --- |

| [app.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/app.ts) | <code>► INSERT-TEXT-HERE</code> |

| [routesConfig.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/routesConfig.ts) | <code>► INSERT-TEXT-HERE</code> |

| [index.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/index.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.services</summary>

  

| File | Summary |

| --- | --- |

| [user.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/services/user.ts) | <code>► INSERT-TEXT-HERE</code> |

| [board.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/services/board.ts) | <code>► INSERT-TEXT-HERE</code> |

| [export.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/services/export.ts) | <code>► INSERT-TEXT-HERE</code> |

| [game.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/services/game.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.errors</summary>

  

| File | Summary |

| --- | --- |

| [ErrorFactory.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/errors/ErrorFactory.ts) | <code>► INSERT-TEXT-HERE</code> |

| [HttpStatusCode.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/errors/HttpStatusCode.ts) | <code>► INSERT-TEXT-HERE</code> |

| [AppError.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/errors/AppError.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database</summary>

  

| File | Summary |

| --- | --- |

| [connection.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/connection.ts) | <code>► INSERT-TEXT-HERE</code> |

| [cache.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/cache.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database.repository</summary>

  

| File | Summary |

| --- | --- |

| [user.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/repository/user.ts) | <code>► INSERT-TEXT-HERE</code> |

| [role.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/repository/role.ts) | <code>► INSERT-TEXT-HERE</code> |

| [game.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/repository/game.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database.models</summary>

  

| File | Summary |

| --- | --- |

| [user.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/models/user.ts) | <code>► INSERT-TEXT-HERE</code> |

| [role.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/models/role.ts) | <code>► INSERT-TEXT-HERE</code> |

| [dao.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/models/dao.ts) | <code>► INSERT-TEXT-HERE</code> |

| [index.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/models/index.js) | <code>► INSERT-TEXT-HERE</code> |

| [game.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/models/game.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database.sequelize-cli.migrations</summary>

  

| File | Summary |

| --- | --- |

| [20240809111449-create-games.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/migrations/20240809111449-create-games.js) | <code>► INSERT-TEXT-HERE</code> |

| [20240807121133-create-roles.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/migrations/20240807121133-create-roles.js) | <code>► INSERT-TEXT-HERE</code> |

| [20240807123931-create-users.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/migrations/20240807123931-create-users.js) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database.sequelize-cli.seeders</summary>

  

| File | Summary |

| --- | --- |

| [20240818092345-game_seed.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/seeders/20240818092345-game_seed.js) | <code>► INSERT-TEXT-HERE</code> |

| [20240807124901-user_seed.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/seeders/20240807124901-user_seed.js) | <code>► INSERT-TEXT-HERE</code> |

| [20240807124854-role_seed.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/seeders/20240807124854-role_seed.js) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.database.sequelize-cli.config</summary>

  

| File | Summary |

| --- | --- |

| [config.js](https://github.com/devedale/tictactoe3d/blob/master/app/src/database/sequelize-cli/config/config.js) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.routes</summary>

  

| File | Summary |

| --- | --- |

| [user.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/routes/user.ts) | <code>► INSERT-TEXT-HERE</code> |

| [game.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/routes/game.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

<details closed><summary>app.src.middlewares</summary>

  

| File | Summary |

| --- | --- |

| [jwtRS256.key.pub](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/jwtRS256.key.pub) | <code>► INSERT-TEXT-HERE</code> |

| [jwtAuth.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/jwtAuth.ts) | <code>► INSERT-TEXT-HERE</code> |

| [filterRequest.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/filterRequest.ts) | <code>► INSERT-TEXT-HERE</code> |

| [errorHandler.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/errorHandler.ts) | <code>► INSERT-TEXT-HERE</code> |

| [logger.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/logger.ts) | <code>► INSERT-TEXT-HERE</code> |

| [methods.ts](https://github.com/devedale/tictactoe3d/blob/master/app/src/middlewares/methods.ts) | <code>► INSERT-TEXT-HERE</code> |

  

</details>

  

---

  

## Getting Started

  

***Requirements***

  

Ensure you have the following dependencies installed on your system:

  

*  **TypeScript**: `version x.y.z`

  

### Installation

  

1. Clone the tictactoe3d repository:

  

```sh

git  clone  https://github.com/devedale/tictactoe3d

```

  

2. Change to the project directory:

  

```sh

cd  tictactoe3d

```

  

3. Install the dependencies:

  

```sh

npm  install

```

  

### Running tictactoe3d

  

Use the following command to run tictactoe3d:

  

```sh

npm  run  build && node  dist/main.js

```

  

### Tests

  

To execute tests, run:

  

```sh

npm  test

```

  

---

  

## Project Roadmap

  

- [X] `► INSERT-TASK-1`

- [ ] `► INSERT-TASK-2`

- [ ] `► ...`

  

---

  

## Contributing

  

Contributions are welcome! Here are several ways you can contribute:

  

-  **[Submit Pull Requests](https://github.com/devedale/tictactoe3d/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

-  **[Join the Discussions](https://github.com/devedale/tictactoe3d/discussions)**: Share your insights, provide feedback, or ask questions.

-  **[Report Issues](https://github.com/devedale/tictactoe3d/issues)**: Submit bugs found or log feature requests for Tictactoe3d.

  

<details closed>

<summary>Contributing Guidelines</summary>

  

1.  **Fork the Repository**: Start by forking the project repository to your GitHub account.

2.  **Clone Locally**: Clone the forked repository to your local machine using a Git client.

```sh

git clone https://github.com/devedale/tictactoe3d

```

3.  **Create a New Branch**: Always work on a new branch, giving it a descriptive name.

```sh

git checkout -b new-feature-x

```

4.  **Make Your Changes**: Develop and test your changes locally.

5.  **Commit Your Changes**: Commit with a clear message describing your updates.

```sh

git commit -m 'Implemented new feature x.'

```

6.  **Push to GitHub**: Push the changes to your forked repository.

```sh

git push origin new-feature-x

```

7.  **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

  

Once your PR is reviewed and approved, it will be merged into the main branch.

  

</details>

  

---

  

## License

  

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

  

---

  

## Acknowledgments

  

- List any resources, contributors, inspiration, etc. here.

  

[**Return**](#-quick-links)

  

---