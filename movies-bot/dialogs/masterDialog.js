const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
// const { MessageFactory, InputHints } = require('botbuilder');
const { InputHints } = require('botbuilder');
// const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const SELECTION_PROMPT = 'SELECTION_PROMPT';

// * CALL OTHER DIALOGS
const { StepRecomendationDialog } = require('../dialogs/stepRecomendationDialog');
const { StepRateDialog } = require('../dialogs/stepRateDialog');
const { StepInformationDialog } = require('../dialogs/stepInformationDialog');

class MasterDialog extends CancelAndHelpDialog {
    constructor(bookingDialog) {
        super('MasterDialog');

        if (!bookingDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt(SELECTION_PROMPT))
            .addDialog(bookingDialog)
            .addDialog(new StepRecomendationDialog('stepRecomendationDialog'))
            .addDialog(new StepRateDialog('stepRateDialog'))
            .addDialog(new StepInformationDialog('stepInformationDialog'))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
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
    async introStep(stepContext) {
        if (!stepContext.values.selected) {
            return await stepContext.prompt(SELECTION_PROMPT, {
                prompt: 'Now you can indicate the number or the word of the present options in the chat message:\n\n' +
                '1.- Recomend movie.\n\n' +
                '2.- Rate movie.\n\n' +
                '3.- Information about specific movie.'
            });
        } else {
            return await stepContext.next(stepContext.values.selected);
        }
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        stepContext.values.selected = stepContext.values.selected || stepContext.result;

        // const messageTextShow = `La opción elegida fue: ${ stepContext.values.selected }`;
        // await stepContext.context.sendActivity(messageTextShow);
        // await stepContext.context.sendActivity('Si llego al segundo paso bro');
        stepContext.values.selected.toLowerCase();
        switch (stepContext.values.selected) {
        case 'recomend':
        case '1': {
            // await stepContext.context.sendActivity('Elegiste recomendar con RECOMENDAR');
            console.log('You chose RECOMENDED');
            return await stepContext.beginDialog('stepRecomendationDialog');
            // break;
        }
        case 'rate':
        case '2': {
            // await stepContext.context.sendActivity('Elegiste calificar con CALIFICAR');
            console.log('You chose RATE');
            return await stepContext.beginDialog('stepRateDialog');
            // break;
        }
        case 'information':
        case '3': {
            // await stepContext.context.sendActivity('Elegiste información con INFORMACION');
            console.log('You chose INFORMATION');
            return await stepContext.beginDialog('stepInformationDialog');
            // break;
        }
        default: {
            await stepContext.context.sendActivity('Sorry, this option is no avaliable. Try again.');
            return await stepContext.endDialog();
        }
        }
        // return await stepContext.next();
    }

    /**
     * Shows a warning if the requested From or To cities are recognized as entities but they are not in the Airport entity list.
     * In some cases LUIS will recognize the From and To composite entities as a valid cities but the From and To Airport values
     * will be empty if those entity values can't be mapped to a canonical item in the Airport.
     */
    async showWarningForUnsupportedCities(context, fromEntities, toEntities) {
        const unsupportedCities = [];
        if (fromEntities.from && !fromEntities.airport) {
            unsupportedCities.push(fromEntities.from);
        }

        if (toEntities.to && !toEntities.airport) {
            unsupportedCities.push(toEntities.to);
        }

        if (unsupportedCities.length) {
            const messageText = `Sorry but the following airports are not supported: ${ unsupportedCities.join(', ') }`;
            await context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const timeProperty = new TimexProperty(result.travelDate);
            const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
            const msg = `I have you booked to ${ result.destination } from ${ result.origin } on ${ travelDateMsg }.`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}

module.exports.MasterDialog = MasterDialog;
