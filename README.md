# alexa-skills-cricket
This Amazon Alexa skill allows the user to extract information related to cricket sport with voice control.

## Terminologies
- Amazon Alexa: Allows hands-free convenience with voice control.
- AWS Lambda: Communicates with an external web service to retrieve information of interest.
- Dialog and Session state: Backend logic hosted on AWS lambda maintains two models (1) a one-shot ask (2) a multi-turn dialog model.
- SSML: Using SSML tags to control how Alexa renders the text-to-speech.

## Examples
Example user interactions:

### dialogue model:
    User:  "Alexa, Open cricket."
    Alexa: "Cricket, do you want to get update?"

    User:  "yes"
    Alexa: "blah series going on blah blah blah? Do you want to get details of any series?"

    User:  "yes"
    Alexa: "give me series number??"

    User:  "one|two|three|four|five|..."
    Alexa: "This series is played b/w XX and XY. XX has won xx matches and xy has won xx matches. Do you want to get detail of any team?"

    User:   "yes"
    Alexa:  "Give me team name?"

    User:   "England"
    Alexa:  "Give detail about the team captain & ranking & coach."

    User:  "No."
    Alexa: "Good bye!"

### one-shot model:
    User:  "Alexa, Open cricket."
    User:  "summary of series number one|two|three|four|five|..."

    User:  "Alexa, Open cricket."
    User:   "summary of team named england|ireland|..."
