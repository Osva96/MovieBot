// const { MessageFactory, InputHints } = require('botbuilder');
// const { InputHints } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const SELECTION_PROMPT = 'SELECTION_PROMPT';
const SEARCH_PROMPT = 'SEARCH_PROMPT';

class StepInformationDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        if (!id) throw new Error('[MainDialog]: Missing parameter \'stepInformationDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt(SELECTION_PROMPT))
            .addDialog(new TextPrompt(SEARCH_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.firstStep.bind(this),
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
        if (!stepContext.values.search) {
            return await stepContext.prompt(SEARCH_PROMPT, {
                prompt: 'Enter the movie you want to search'
            });
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async lastStep(stepContext) {
        stepContext.values.search = stepContext.values.search || stepContext.result;

        stepContext.values.search.toLowerCase();

        const googleText = stepContext.values.search.replace(/ /g, '+');
        const tmdbText = stepContext.values.search.replace(/ /g, '+');
        const imdbText = stepContext.values.search.replace(/ /g, '+');

        await stepContext.context.sendActivity(
            '[Search ' +
            stepContext.values.search +
            ' in Google](https://www.google.com/search?q=' +
            googleText +
            '&oq=' +
            googleText +
            ')\n\n' +
            '[Search ' +
            stepContext.values.search +
            ' in TMDB](https://www.themoviedb.org/search?query=' +
            tmdbText +
            ')\n\n' +
            '[Search ' +
            stepContext.values.search +
            ' in IMDB](https://www.imdb.com/find?q=' +
            imdbText +
            '&ref_=nv_sr_sm' +
            ')'
        );

        return stepContext.endDialog();
        // Restart the main dialog with a different message the second time around
        // return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}

module.exports.StepInformationDialog = StepInformationDialog;
