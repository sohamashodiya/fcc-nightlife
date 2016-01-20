var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var goingSchema = new Schema({
    username     : String,
    bus_id       : String
});

module.exports = mongoose.model('Going', goingSchema);