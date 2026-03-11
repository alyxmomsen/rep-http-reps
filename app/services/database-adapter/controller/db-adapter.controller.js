const { DATABASE_TABLES, DBAdapter } = require("../models/db-adapter.model");
const { playlistController } = require("../models/validate-strategies.models/playlist.schema.model");
const { usersController } = require("../models/validate-strategies.models/users.strategy.schema");
const { videoFilesController } = require("../models/validate-strategies.models/video-files.schema.model");

/**
 * @type {Map<string,DBAdapter}
 */
const dbControllersRouter = new Map();

dbControllersRouter.set(DATABASE_TABLES.VIDEO_FILES , videoFilesController);
dbControllersRouter.set(DATABASE_TABLES.PLAYLIST , playlistController);
dbControllersRouter.set(DATABASE_TABLES.USERS , usersController);

module.exports = { dbControllersRouter }