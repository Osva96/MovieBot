// const { MessageFactory, InputHints } = require('botbuilder');
// const { InputHints } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder-core');

const MovieRateCard = require('../resources/movieRateCard.json');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const SELECTION_PROMPT = 'SELECTION_PROMPT';
const RATE_PROMPT = 'RATE_PROMPT';

class StepRateDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        if (!id) throw new Error('[MainDialog]: Missing parameter \'StepRateDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt(SELECTION_PROMPT))
            .addDialog(new TextPrompt(RATE_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.lastStep.bind(this)
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
        await stepContext.context.sendActivity({ attachments: [CardFactory.adaptiveCard(MovieRateCard)] });

        return await stepContext.next();
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async secondStep(stepContext) {
        if (!stepContext.values.rate) {
            return await stepContext.prompt(RATE_PROMPT, {
                prompt: 'Your qualification is...'
            });
            // return await stepContext.sendActivity('Your qualification is...', 'Your qualification is...', InputHints.ExpectingInput);
            // return stepContext.next();
        } else {
            return stepContext.next();
        }

        // return await stepContext.next();
        // return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    async lastStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.StepRateDialog = StepRateDialog;
