var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var historySchema = new Schema({
    username     : String,
    lastSearch   : String
});

module.exports = mongoose.model('History', historySchema);