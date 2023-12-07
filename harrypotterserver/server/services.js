const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const harryPotterSpells = require("harry-potter-spells");

var dbURL  = "mongodb://localhost";

var services = function(app) {
    app.post('/add-spell', function(req, res) {
        var name = req.body.name;
        var type = req.body.type;
        var effect = req.body.effect;
        var counter = req.body.counter;

        var newSpell = {
            name: name,
            type: type,
            effect: effect,
            'counter-spell': counter
        };

        MongoClient.connect(dbURL, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                return res.status(201).send(JSON.stringify({ msg: err }));
            } else {
                var dbo = client.db("harrypotter");

                dbo.collection("spells").insertOne(newSpell, function(err) {
                    if (err) {
                        return res.status(201).send(JSON.stringify({ msg: err }));
                    } else {
                        return res.status(200).send(JSON.stringify({ msg: "SUCCESS" }));
                    }
                });
            }
        });
    });

    app.get('/get-spells', function(req, res) {
        MongoClient.connect(dbURL, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                return res.status(201).send(JSON.stringify({ msg: err }));
            } else {
                var dbo = client.db("harrypotter");

                dbo.collection("spells").find().toArray(function(err, data) {
                    if (err) {
                        return res.status(201).send(JSON.stringify({ msg: err }));
                    } else {
                        return res.status(200).send(JSON.stringify({ msg: "SUCCESS", spells: data }));
                    }
                });
            }
        });
    });

    app.get("/get-spellsByType", function(req, res) {

    });

    app.put('/update-spell', function(req, res) {

    });

    app.delete('/delete-spell', function(req, res) {
        var spellID = req.query.id;
        var s_id = new ObjectId(spellID);

        var search = { _id: s_id };

        MongoClient.connect(dbURL, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                return res.status(201).send(JSON.stringify({ msg: err }));
            } else {
                var dbo = client.db("harrypotter");

                dbo.collection("spells").deleteOne(search, function(err) {
                    if (err) {
                        return res.status(201).send(JSON.stringify({ msg: err }));
                    } else {
                        return res.status(200).send(JSON.stringify({ msg: "SUCCESS" }));
                    }
                });
            }
        });
    });

    app.post('/refreshSpells', function(req, res) {
        MongoClient.connect(dbURL, { useUnifiedTopology: true }, function(err, client) {
            if (err) {
                client.close();
                return res.status(200).send(JSON.stringify({ msg: "Error: " + err }));
            }

            var dbo = client.db("harrypotter");

            dbo.collection("spells").drop(function(err, delOK) {
                if (err) {
                    client.close();
                    return res.status(200).send(JSON.stringify({ msg: "Error: " + err }));
                } else {
                    if (delOK) {
                        var spells = harryPotterSpells.all;

                        dbo.collection("spells").insertMany(spells, function(err, response) {
                            if (err) {
                                client.close();
                                return res.status(200).send(JSON.stringify({ msg: "Error: " + err }));
                            }
                            client.close();
                            return res.status(201).send(JSON.stringify({ msg: "SUCCESS" }));
                        });
                    } else {
                        return res.status(201).send(JSON.stringify({ msg: "Error: Cannot delete table" }));
                    }
                }
            });
        });
    });
}

var initializeDatabase = function() {
    MongoClient.connect(dbURL, { useUnifiedTopology: true }, function(err, client) {
        if (err) {
            console.log(err);
        } else {
            var dbo = client.db("harrypotter");

            dbo.collection("spells").find().toArray(function(err, data) {
                if (err) {
                    client.close();
                    console.log(err);
                } else {
                    if (data.length === 0) {
                        var spells = harryPotterSpells.all;

                        dbo.collection("spells").insertMany(spells, function(err) {
                            if (err) {
                                client.close();
                                console.log(err);
                            } else {
                                console.log("Added seed records");
                                client.close();
                            }

                        });
                    } else {
                        console.log("Seed record already exists");
                        client.close();
                    }

                }
            });
        }
    });
}

module.exports = { services, initializeDatabase };
