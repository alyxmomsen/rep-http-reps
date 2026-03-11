const { DATABASE_TABLES } = require("../models/db-adapter.model");
const { filesController } = require("../models/validate-strategies.models/files.strategy.model");
const { playlistController } = require("../models/validate-strategies.models/playlist.strategy.model");

const dbControllersRouter = new Map();

dbControllersRouter.set(DATABASE_TABLES.FILES , filesController);
dbControllersRouter.set(DATABASE_TABLES.PLAYLIST , playlistController);

module.exports = { dbControllersRouter }