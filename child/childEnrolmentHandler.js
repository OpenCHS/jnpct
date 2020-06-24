import {
    StatusBuilderAnnotationFactory, 
    RuleFactory,  
    FormElementsStatusHelper,
    WithName
} from 'rules-config/rules';
import {EnrolmentEligibilityCheck} from "rules-config";


const filter = RuleFactory('95796c7b-cb70-48f5-893f-c0c8afbc3785', 'ViewFilter');
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEnrolment', 'formElement');


@EnrolmentEligibilityCheck({
    name: 'childenrolmenteligibility',
    uuid: 'a26898f7-054f-4109-9283-c17a27c3582a',
    programUUID: 'b54328b6-3e9a-4df7-915e-5b54cd772d43',
    executionOrder: 100.0,
    metadata: {}
})
class ChildEnrolmEnteligibility {
    static exec({individual}) {
        return individual.getAgeInYears() <= 5;
    }
}

@filter('3d142634-4a0e-45d5-8338-b49a82c3c508', 'ChildEnrolmentFormHandler', 100.0)
class ChildEnrolmentFormHandler {
    static exec(programEnrolment, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ChildEnrolmentFormHandler(), programEnrolment, formElementGroup, today);
    }

    @WithName('Current Weight')
    @WithStatusBuilder
    a1([], statusBuilder) {
            statusBuilder.show().when.valueInEnrolment('Is child getting registered at Birth')
            .containsAnswerConceptName("No");
    }

    @WithName('Birth Weight')
    @WithStatusBuilder
    a2([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment('Is child getting registered at Birth')
            .containsAnswerConceptName("Yes");
    }

}




module.exports = {ChildEnrolmentFormHandler,ChildEnrolmEnteligibility};