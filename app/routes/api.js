var History = require("../models/history.js");
var Going = require("../models/going.js");
var async = require("async");

module.exports = function(app, yelp) {

    function goingCount(bus_id, callback) {
        //console.log("Inside of goingCount");
        Going.count({
            bus_id: bus_id
        }, callback);
    }

    function setGoingCount(data, res) {
        //console.log("Finding counts");
        async.each(data.businesses, function(business, callback) {
            goingCount(business.id, function(err, count) {
                if (err) {
                    callback(err);
                }
                else {
                    business.goingCount = count;
                    //console.log(business.id, count);
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                res.json({
                    error: err
                });
            }
            else {
                res.json(data);
            }
        });
    }

    app.get('/api/search/:location', function(req, res) {
        yelp.search({
                term: 'bars',
                location: req.params.location
            })
            .then(function(data) {
                if (req.user) {
                    //console.log("User is logged in")
                    var lastSearch = req.params.location;
                    var history = {};
                    history.username = req.user.github.username;
                    history.lastSearch = lastSearch;
                    //console.log("Made history");
                    History.findOneAndUpdate({
                            username: req.user.github.username
                        },
                        history, {
                            upsert: true
                        },
                        function(err) {
                            //console.log("In upsert callback");
                            if (err) {
                                console.log("Error", err);
                                res.json({
                                    "Error": "Error"
                                })
                            }
                            else {
                                setGoingCount(data, res);
                            }
                        }
                    );
                }
                else {
                    setGoingCount(data, res);
                }
            })
            .catch(function(err) {
                res.json({
                    error: err
                });
            });
    });

    app.get('/api/getUser', function(req, res) {
        if (req.isAuthenticated()) {
            res.json({
                status: "loggedIn",
                github: req.user.github
            });
        }
        else {
            res.json({
                status: "notLoggedIn"
            });
        }
    });

    app.get('/api/getLastSearch', function(req, res) {
        var query = History.where({
            username: req.user.github.username
        });
        query.findOne(function(err, data) {
            if (err) {
                console.log("Error");
                res.json({
                    "Error": "Error"
                });
            }
            else {
                res.json(data);
            }
        });
    });

    app.get('/api/going/:bus_id', function(req, res) {
        if (!req.user) {
            res.json({
                userLoggedIn: false
            });
        }
        else {
            //console.log("In route");
            var query = Going.where({
                bus_id: req.params.bus_id
            });
            query.findOne(function(err, data) {
                if (err) {
                    console.log("Error");
                    res.json({
                        "Error": "Error"
                    });
                }
                else {
                    if (data) {
                        Going.findOneAndRemove({
                            username: req.user.github.username,
                            bus_id: req.params.bus_id
                        }, function(err) {
                            if (err) {
                                console.log("Error");
                                res.json({
                                    "Error": "Error"
                                });
                            }
                            else {
                                goingCount(req.params.bus_id, function(err, data) {
                                    if (err) {
                                        console.log("Error");
                                        res.json({
                                            "Error": "Error"
                                        });
                                    }
                                    else {
                                        res.json({
                                            "numGoing": data
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        //console.log("Making new document")
                        var going = new Going();
                        going.username = req.user.github.username;
                        going.bus_id = req.params.bus_id;
                        going.save();
                        //console.log("Saved");
                        goingCount(req.params.bus_id, function(err, data) {
                            if (err) {
                                console.log("Error");
                                res.json({
                                    "Error": "Error"
                                });
                            }
                            else {
                                res.json({
                                    "numGoing": data
                                });
                            }
                        });
                    }
                }
            });
        }
    });


}