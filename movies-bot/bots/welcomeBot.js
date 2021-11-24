// const { CardFactory } = require('botbuilder-core');
// const { StepInformationDialog } = require('../dialogs/stepInformationDialog');
// const { InputHints } = require('botframework-schema');
const { DialogBot } = require('./dialogBot');
// const { InputHints, MessageFactory } = require('botbuilder');

class WelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    context.sendActivity('Welcome to the movie recommendation sistem!');
                    context.sendActivity('If you need help about how the chat works ' +
                    'you can enter the word help.');

                    await dialog.run(context, conversationState.createProperty('DialogState'));
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.WelcomeBot = WelcomeBot;
