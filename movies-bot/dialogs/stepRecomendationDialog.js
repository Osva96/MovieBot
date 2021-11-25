const { MessageFactory, InputHints } = require('botbuilder');
const { CardFactory } = require('botbuilder-core');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ConfirmPrompt } = require('botbuilder-dialogs');

// * IMPORT CARDS
const MovieGenreHorrorCard = require('../resources/movieGenreHorrorCard.json');
const MovieGenreActionCard = require('../resources/movieGenreActionCard.json');
const MovieGenreThrillerCard = require('../resources/movieGenreThrillerCard.json');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const SELECTION_PROMPT = 'SELECTION_PROMPT';
const GENRE_PROMPT = 'GENRE_PROMPT';
const CONFIRM_PROMPT = 'confirmPrompt';
const MAIL_PROMPT = 'mailPrompt';

class StepRecomendationDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        if (!id) throw new Error('[MainDialog]: Missing parameter \'StepRecomendationDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt(SELECTION_PROMPT))
            .addDialog(new TextPrompt(GENRE_PROMPT))
            .addDialog(new TextPrompt(MAIL_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this),
                this.lastStep.bind(this),
                this.finishStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Primer paso del Waterfall Dialog. Primero preguntamos al usuario que acción
     * le gustaría realizar presentando las opciones que puede elegir
     */
    async firstStep(stepContext) {
        if (!stepContext.values.genre) {
            return await stepContext.prompt(GENRE_PROMPT, {
                prompt: 'What genre is the movie you search?'
            });
        } else {
            return await stepContext.next(stepContext.values.genre);
        }
    }

    async secondStep(stepContext) {
        stepContext.values.genre = stepContext.values.genre || stepContext.result;

        stepContext.values.genre.toLowerCase();
        switch (stepContext.values.genre) {
        case 'horror': {
            // console.log('Chose HORROR');
            await stepContext.context.sendActivity({ attachments: [CardFactory.adaptiveCard(MovieGenreHorrorCard)] });
            return await stepContext.next();
        }
        case 'action': {
            await stepContext.context.sendActivity({ attachments: [CardFactory.adaptiveCard(MovieGenreActionCard)] });
            return await stepContext.next();
        }
        case 'thriller': {
            await stepContext.context.sendActivity({ attachments: [CardFactory.adaptiveCard(MovieGenreThrillerCard)] });
            return await stepContext.next();
        }
        default: {
            stepContext.context.sendActivity('Sorry, I dont have options with the genre ' + stepContext.values.genre);
            return await stepContext.endDialog();
        }
        }
    }

    /**
     * This is the third step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async thirdStep(stepContext) {
        const messageText = 'Do you want share your email to send you new recomendations dialy?';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    async lastStep(stepContext) {
        if (stepContext.result === true) {
            return await stepContext.prompt(MAIL_PROMPT, {
                prompt: 'Please, write your email.'
            });
        } else {
            await stepContext.context.sendActivity('OK, maybe the next time.');
            return await stepContext.endDialog();
        }
    }

    async finishStep(stepContext) {
        await stepContext.context.sendActivity('Thanks for providing your email.');
        return await stepContext.endDialog();
    }
}

module.exports.StepRecomendationDialog = StepRecomendationDialog;
