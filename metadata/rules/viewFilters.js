import {
    StatusBuilderAnnotationFactory, 
    RuleFactory,  
    FormElementsStatusHelper,
    FormElementStatusBuilder,
    FormElementStatus,
    WithName
} from 'rules-config/rules';

const ProgramExitViewFilter = RuleFactory("3db7f626-bc87-4cd1-b897-486c9d431905", "ViewFilter");
@ProgramExitViewFilter("a9f5408e-0dff-42f4-aa74-dcae9f7d7986", "Program Exit Filter", 101.0, {})
 class ProgramExitViewFilterHandler {
    static exec(programExit, formElementGroup) {
        return FormElementsStatusHelper.getFormElementsStatuses(new ProgramExitViewFilterHandler(), programExit, formElementGroup);
    }

   otherReasonPleaseSpecify(programExit, formElement) {
        const statusBuilder = this._getStatusBuilder(programExit, formElement);
        statusBuilder.show().when.valueInExit("Reason for exit").containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    _getStatusBuilder(programExit, formElement) {
        return new FormElementStatusBuilder({
            programEnrolment: programExit,
            formElement
        });
    }

}


const statusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');
const filters = RuleFactory("406738d4-c96c-498c-99e7-4389cb454d5c", "ViewFilter");
@filters("6bf17e6e-cb3a-4928-a99c-6e150e1015a2", "Cancel Form filters", 121.0, {})
class ProgramCancellationFormFilters {

  
    otherReason(programEncounter, formElement) {
        const cancelReasonObs = programEncounter.findCancelEncounterObservation('Visit cancel reason');
        const answer = cancelReasonObs && cancelReasonObs.getReadableValue();
        return new FormElementStatus(formElement.uuid, answer === 'Other');
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper.getFormElementsStatusesWithoutDefaults(new ProgramCancellationFormFilters(), programEncounter, formElementGroup, today);
    }
}


module.exports = {ProgramExitViewFilterHandler, ProgramCancellationFormFilters};

 
