const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
// const { MessageFactory, InputHints } = require('botbuilder');
const { InputHints } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const SELECTION_PROMPT = 'SELECTION_PROMPT';
const GENRE_PROMPT = 'GENRE_PROMPT';

class StepRecomendationDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        if (!id) throw new Error('[MainDialog]: Missing parameter \'StepRecomendationDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt(SELECTION_PROMPT))
            .addDialog(new TextPrompt(GENRE_PROMPT))
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
        // console.log('jalo');
        // stepContext.context.sendActivity('SI PASO A STEPINFO');
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
        // console.log(`Opción elegida: ${ stepContext.values.genre }`);
        // return await stepContext.endDialog();

        stepContext.values.genre.toLowerCase();
        switch (stepContext.values.genre) {
        case 'horror': {
            console.log('Chose HORROR');
            break;
        }
        case 'action': {
            console.log('Chose ACTION');
            break;
        }
        default: {
            stepContext.context.sendActivity('Sorry, I dont have options with the genre ' + stepContext.values.genre);
            return await stepContext.endDialog();
        }
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async lastStep(stepContext) {
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

module.exports.StepRecomendationDialog = StepRecomendationDialog;
