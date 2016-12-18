/**
 * MIT License
 */

'use strict';

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.1822a5c0-bc28-42bf-80fa-8d2da3fe43ae";

/**
 * The HTTP Module for HTTP related functionality
 */
var http = require('http');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * Card Title
 */
var cardTitle = "Cricket";

/**
 * Communication level with user.
 * These levels are used to maintain the session with user.
 */
var COMM_LEVEL = {
    ON_GOING_SERIES_SUMMARY: 0,
    SPECIFIC_SERIES_SUMMARY: 1,
    SPECIFIC_SERIES_SUMMARY_GET_SERIES_NUMBER: 2,
    SPECIFIC_TEAM_SUMMARY_GET_TEAM_NAME: 3,
    SPECIFIC_TEAM_SUMMARY: 4,
};

/**
 * Cricket is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Cricket = function () {
    AlexaSkill.call(this, APP_ID);
};

/**
 * Extend AlexaSkill to Cricket information
 */
Cricket.prototype = Object.create(AlexaSkill.prototype);
Cricket.prototype.constructor = Cricket;

/**
 * Implement callback for start of session
 */
Cricket.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Cricket onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);

    // Set session attribute to track communication with user
    session.attributes.level = COMM_LEVEL.ON_GOING_SERIES_SUMMARY;
};

/**
 * Implement callback on skill launch
 */
Cricket.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Cricket onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(session, response);
};

/**
 * Implement callback for end-of-session
 */
Cricket.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
};

/**
 * Register different intents
 */
Cricket.prototype.intentHandlers = {

    "CricketIntent": function (intent, session, response) {
        CricketIntentRequest(intent, session, response);
    },

    "SeriesInfoIntent": function (intent, session, response) {
        SeriesInfoIntentRequest(intent, session, response);
    },

    "TeamInfoIntent": function (intent, session, response) {
        TeamInfoIntentRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Cricket Skill, you can get up to date news of what is happening in Cricket sport world. " +
                         "For interaction, you could say give me update, or you can say exit.";
        var repromptText = "What do you want?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to say welcome user and to start activity with end user.
 */
function getWelcomeResponse(session, response) {

    var repromptText = "With Cricket Skill, you can get up to date news of cricket sport.";
    var speechText = "<p>Cricket.</p> <p>Do you want to get update?</p>";
    var cardOutput = "Cricket. Do you want to get update?";

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    // Maintain the same session attributes
    session.attributes.level = session.attributes.level;

    // Ask user to proceed
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * This function handles dialogue based interaction with user.
 */
function CricketIntentRequest(intent, session, response) {
    var repromptText = "With Cricket Skill, you can get up to date news of cricket sport.";
    var speechText = '';
    var cardContent = '';
    var level;

    // Extract session attributes if there is any
    if (session.attributes && session.attributes.level) {
        level = session.attributes.level;
    }
    else {
        level = COMM_LEVEL.ON_GOING_SERIES_SUMMARY;
    }

    // Perform action as per communication level with user
    if (level === COMM_LEVEL.ON_GOING_SERIES_SUMMARY) {
        getOnGoingSeries(intent, session, function (events) {
            if (events.length === 0) {
                speechText = "There is a problem in getting data. Please try again later. Thanks!";
                response.tell(speechText);
            }
            else {
                speechText = '<p>' + events + '</p>';
                speechText = speechText + '<p>Do you want to get details of any series?</p>';
                cardContent = speechText;

                var speechOutput = {
                    speech: "<speak>" + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                var repromptOutput = {
                    speech: repromptText,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };

                // Let's assume that user will go to next level
                session.attributes.level = COMM_LEVEL.SPECIFIC_SERIES_SUMMARY;

                // Give results to user and ask next question
                response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
            }
        });
    }
    else if (level === COMM_LEVEL.SPECIFIC_SERIES_SUMMARY) {
        speechText = '<p>' + 'Give me series number?' + '</p>';
        cardContent = speechText;

        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        // Let's assume that user will go to next level
        session.attributes.level = COMM_LEVEL.SPECIFIC_SERIES_SUMMARY_GET_SERIES_NUMBER;

        // Give results to user and ask next question
        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
    }
    else if (level === COMM_LEVEL.SPECIFIC_SERIES_SUMMARY_GET_SERIES_NUMBER) {

        getOnGoingSpecificSeriesSummary(intent, session, function (events) {
            if (events.length === 0) {
                speechText = "There is a problem in getting data. Please try again later. Thanks!";
                response.tell(speechText);
            }
            else {
                speechText = '<p>' + events + '</p>';
                speechText = speechText + '<p>Do you want to get detail of any team?</p>';
                cardContent = speechText;

                var speechOutput = {
                    speech: "<speak>" + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                var repromptOutput = {
                    speech: repromptText,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };

                // Let's assume that user will go to next level
                session.attributes.level = COMM_LEVEL.SPECIFIC_TEAM_SUMMARY_GET_TEAM_NAME;

                // Give results to user and ask next question
                response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
            }
        });
    }
    else if (level === COMM_LEVEL.SPECIFIC_TEAM_SUMMARY_GET_TEAM_NAME) {
        speechText = '<p>' + 'Give me team name?' + '</p>';
        cardContent = speechText;

        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        // Let's assume that user will go to next level
        session.attributes.level = COMM_LEVEL.SPECIFIC_TEAM_SUMMARY;

        // Give results to user and ask next question
        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
    }
    else if (level === COMM_LEVEL.SPECIFIC_TEAM_SUMMARY) {

        getTeamSummary(intent, session, function (events) {
            if (events.length === 0) {
                speechText = "There is a problem in getting data. Please try again later. Thanks!";
                response.tell(speechText);
            }
            else {
                speechText = events;

                // Give results to user
                response.tell(speechText);
            }
        });
    }
    else {
        response.tell('unknown level ' + level);
    }
}

/**
 * This function handles one-shot message form the user to get info
 * of a specific series.
 */
function SeriesInfoIntentRequest(intent, session, response) {
    var speechText = '';

    getOnGoingSpecificSeriesSummary(intent, session, function (events) {
        if (events.length === 0) {
            speechText = "There is a problem in getting data. Please try again later. Thanks!";
            response.tell(speechText);
        }
        else {
            speechText = events;
            response.tellWithCard(speechText, cardTitle, speechText);
        }
    });
}

/**
 * This function handles one-shot message form the user to get info
 * of a specific team.
 */
function TeamInfoIntentRequest(intent, session, response) {
    var speechText = '';

    getTeamSummary(intent, session, function (events) {
        if (events.length === 0) {
            speechText = "There is a problem in getting data. Please try again later. Thanks!";
            response.tell(speechText);
        }
        else {
            speechText = events;
            response.tellWithCard(speechText, cardTitle, speechText);
        }
    });
}

/**
 * Utility function to retrieve information related to on-going series.
 *  This information retrieval occurs in multiple stages. i.e:
 *      1) Sent HTTP GET request
 *      2) Retrieve response
 *      3) Parse JSON response to extract information of specific interest.
 */
function getOnGoingSeries(intent, session, eventCallback) {
    var ongoingSeriesURL = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.ongoing&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=';

    // Send HTTP request
    var req = http.get(ongoingSeriesURL, function (res) {
        var responseChunks = [];

        res.on('data', function (chunk) {
            // Save partly response data
            responseChunks.push(chunk);
        });

        res.on('end', function () {
            // All data is received
            var data = Buffer.concat(responseChunks);
            var json = JSON.parse(data);

            if (json.error) {
                console.log('ERROR: ' + json.error.message);
                return;
            }
            else {
                var speechText = '';
                var i, j;

                var seriesCount = json.query.count;
                var seriesArray = json.query.results.Series;

                // Build speech text by extract information of our specific interest
                speechText = speechText + ' ' + seriesCount + " series going on in cricket. ";

                for (i = 0; i < seriesCount; i++) {

                    var teamAName;
                    var teamBName;

                    teamAName = seriesArray[i].Participant.Team[0].Name;
                    teamBName = seriesArray[i].Participant.Team[1].Name;

                    // Build speech text by extrating information of our specific interest
                    speechText +=   (i + 1) + '). ' +
                                    seriesArray[i].Participant.mtype + ' matches between ' +
                                    teamAName + ' and ' +
                                    teamBName + '. ';
                }

                // Return results
                eventCallback(speechText);
            }
        });
    });

    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        return;
    });
}

/**
 * Utility function to retrieve information related to a specific on-going series.
 *  This information retrieval occurs in multiple stages. i.e:
 *      1) Sent HTTP GET request
 *      2) Retrieve response
 *      3) Parse JSON response to extract information of specific interest.
 */
function getOnGoingSpecificSeriesSummary(intent, session, eventCallback) {

    // Extract required information given by user.
    // This info is packed as intent.slot by Amazon Alexa
    var userSeriesNumber = intent.slots.SeriesNumber;
    var userSeriesNumberValue = parseInt(userSeriesNumber.value);
    if (isNaN(userSeriesNumberValue)) {
        console.log('ERROR: ' + 'Invalid series number = ' + userSeriesNumber.value);
        return;
    }

    var ongoingSeriesURL = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.ongoing&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=';

    // Send HTTP request
    var req = http.get(ongoingSeriesURL, function (res) {
        var responseChunks = [];

        res.on('data', function (chunk) {
            // Save partly response data
            responseChunks.push(chunk);
        });

        res.on('end', function () {
            // All data is received
            var data = Buffer.concat(responseChunks);
            var json = JSON.parse(data);

            if (json.error) {
                console.log('ERROR: ' + json.error.message);
                return;
            }
            else {
                var speechText = '';

                var i, j;

                userSeriesNumberValue = userSeriesNumberValue - 1;
                var seriesCount = json.query.count;
                var seriesArray = json.query.results.Series;

                for (i = 0; i < seriesCount; i++) {

                    if (userSeriesNumberValue === i) {
                        var teamAId, teamAName, teamAWon = 0;
                        var teamBId, teamBName, teamBWon = 0;

                        teamAId = seriesArray[i].Participant.Team[0].teamid;
                        teamBId = seriesArray[i].Participant.Team[1].teamid;

                        teamAName = seriesArray[i].Participant.Team[0].Name;
                        teamBName = seriesArray[i].Participant.Team[1].Name;

                        var matchesArray = seriesArray[i].Schedule.Match;
                        var matchCount =  matchesArray.length;
                        var isDecided = 0;

                        for (j = 0; j < matchCount; j++) {
                            if (matchesArray[j].status === "post") {

                                // Make flag that there is atleast one match which is complete
                                isDecided = 1;

                                // Build stats
                                if (teamAId === matchesArray[j].Result.Team[0].id) {
                                    if (matchesArray[j].Result.Team[0].matchwon === "yes") {
                                        teamAWon += 1;
                                    }
                                }
                                if (teamAId === matchesArray[j].Result.Team[1].id) {
                                    if (matchesArray[j].Result.Team[1].matchwon === "yes") {
                                        teamAWon += 1;
                                    }
                                }

                                if (teamBId === matchesArray[j].Result.Team[0].id) {
                                    if (matchesArray[j].Result.Team[0].matchwon === "yes") {
                                        teamBWon += 1;
                                    }
                                }
                                if (teamBId === matchesArray[j].Result.Team[1].id) {
                                    if (matchesArray[j].Result.Team[1].matchwon === "yes") {
                                        teamBWon += 1;
                                    }
                                }
                            }
                        }

                        // Build speech text based on stats
                        speechText = speechText + teamAName + ' and ' +  teamBName + ' are playing this ' + seriesArray[i].Participant.mtype + ' matches series. ';

                        if (isDecided === 0) {
                            speechText = speechText + " No match is yet concluded.";
                        }
                        else {
                            speechText = speechText + " " + matchCount + " matches have been played. ";
                            speechText = speechText + " Where " + teamAName + " has won "  + teamAWon + ". ";
                            speechText = speechText + " And "   + teamBName + " has won "  + teamBWon + " matches. ";
                        }
                    }
                }

                // Return results
                eventCallback(speechText);
            }
        });
    });

    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        return;
    });
}

/**
 * Utility function to retrieve information related to a specific team.
 *  This information retrieval occurs in multiple stages. i.e:
 *      1) Sent HTTP GET request
 *      2) Retrieve response
 *      3) Parse JSON response to extract information of specific interest.
 */
function getTeamSummary(intent, session, eventCallback) {

    // Extract required information given by user.
    // This info is packed as intent.slot by Amazon Alexa
    var TeamName = intent.slots.TeamName;
    var TeamNameValue = TeamName.value;

    // Build URL to have WHERE clause to a specific team
    var teamInfoURL = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.teams%20WHERE%20TeamName="';
        teamInfoURL = teamInfoURL + TeamNameValue;
        teamInfoURL = teamInfoURL + '"%20&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback=';

    // Send HTTP request
    var req = http.get(teamInfoURL, function (res) {
        var responseChunks = [];

        res.on('data', function (chunk) {
            // Save partly response data
            responseChunks.push(chunk);
        });

        res.on('end', function () {
            // All data is received
            var data = Buffer.concat(responseChunks);
            var json = JSON.parse(data);

            if (json.error) {
                console.log('ERROR: ' + json.error.message);
                return;
            }
            else {
                var speechText = '';

                var i, j;

                // Build speech text by extract information of our specific interest

                var Ranking = json.query.results.Team.Ranking;
                for (i = 0; i < Ranking.length; i++) {
                    speechText = speechText + 'Team is at position number ' + Ranking[i].content + ' in ' + Ranking[i].mtype + ' cricket world. ';
                }

                var Captain = json.query.results.Team.Captain;
                for (i = 0; i < Captain.length; i++) {
                    speechText = speechText + Captain[i].FirstName + ' ' + Captain[i].LastName + ' is captain for ' + Captain[i].mtype + ' cricket world. ';
                }

                var Coach = json.query.results.Team.Coach;
                speechText = speechText + Coach.FirstName + ' ' + Coach.LastName + ' is coach for the team.';

                // Return results
                eventCallback(speechText);
            }
        });
    });

    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        return;
    });
}

/**
 * Create the handler that responds to the Alexa Request.
 */
exports.handler = function (event, context) {
    // Create an instance of the Cricket Skill.
    var skill = new Cricket();
    skill.execute(event, context);
};
