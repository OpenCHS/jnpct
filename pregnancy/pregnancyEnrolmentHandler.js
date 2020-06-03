const _ = require("lodash");
import {
    FormElementsStatusHelper,
    FormElementStatus,
    FormElementStatusBuilder,
    ProgramRule,
    RuleFactory,
    StatusBuilderAnnotationFactory,
    VisitScheduleBuilder,
    complicationsBuilder as ComplicationsBuilder,
    WithName
} from 'rules-config/rules';
import lib from '../lib';

const PregnancyEnrolmentViewFilter = RuleFactory("d40e8aa2-8cae-4b09-ad30-2da6c1690206", "ViewFilter");
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEnrolment', 'formElement');
const PregnancyDecision = RuleFactory("d40e8aa2-8cae-4b09-ad30-2da6c1690206", "Decision");

@PregnancyEnrolmentViewFilter("e9026eb6-99c0-4dd4-99f8-14f24f95719b", "JNPCT Pregnancy Enrolment View Filter", 100.0, {})
class PregnancyEnrolmentViewFilterHandlerJNPCT {
    static exec(programEnrolment, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new PregnancyEnrolmentViewFilterHandlerJNPCT(), programEnrolment, formElementGroup, today);
    }

    edd(programEnrolment, formElement) {
            const lmpDate = programEnrolment.getObservationValue('Last menstrual period');
            return _.isNil(lmpDate) ?
                new FormElementStatus(formElement.uuid, true) :
                new FormElementStatus(formElement.uuid, true, lib.calculations.estimatedDateOfDelivery(programEnrolment));
    }


    @WithName('Other previous history of disease - Please specify')
    @WithStatusBuilder
    p1([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Previous history of disease").containsAnswerConceptName("Other");
    }

    @WithName('Parity')
    @WithStatusBuilder
    p2([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName('Number of Abortion')
    @WithStatusBuilder
    p3([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName('Number of live childrens')
    @WithStatusBuilder
    p4([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName('MALE')
    @WithStatusBuilder
    p5([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Number of live childrens").is.greaterThan(0);
    }

    @WithName('FEMALE')
    @WithStatusBuilder
    p6([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Number of live childrens").is.greaterThan(0);
    }

    @WithName('Result of last delivery')
    @WithStatusBuilder
    p7([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName('Age of Youngest child')
    @WithStatusBuilder
    p8([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Number of live childrens").is.greaterThan(0);
    }

    @WithName('Place of last delivery')
    @WithStatusBuilder
    p9([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName('Risk in the last pregnancy')
    @WithStatusBuilder
    p10([], statusBuilder) {
        statusBuilder.show().when.valueInEnrolment("Gravida").containsAnswerConceptNameOtherThan("1");
    }

    @WithName("what kind of risk occurred")
    @WithStatusBuilder
    p11([], statusBuilder) {
         statusBuilder.show().when.valueInEnrolment("Risk in the last pregnancy").is.yes;
    }

 }

 @PregnancyDecision("df4df8fb-fe90-4fff-be78-d624e9ac094b", "Pregnancy Form Decision", 100.0, {})
 export class PregnancyFormDecisionHandler {
     static conditionDecisions(programEnrolment) {
         const complicationsBuilder = new ComplicationsBuilder({
             programEnrolment: programEnrolment,
             complicationsConcept: "High Risk"
         });

         complicationsBuilder
             .addComplication("Underage Pregnancy")
             .when.ageInYears.is.lessThanOrEqualTo(18);

         complicationsBuilder
             .addComplication("Old age Pregnancy")
             .when.ageInYears.is.greaterThanOrEqualTo(35);

        complicationsBuilder
            .addComplication("Previous history of disease")
            .when.valueInEnrolment('Previous history of disease')
            .containsAnyAnswerConceptName("Tuberculosis","Blood Pressure",
             "Heart disease","Diabetes","Asthama","Other");

        complicationsBuilder
            .addComplication("Gravida")
            .when.valueInEnrolment('Gravida')
            .containsAnswerConceptName("5 and more");

        complicationsBuilder
            .addComplication("Result of last delivery")
            .when.valueInEnrolment('Result of last delivery')
            .containsAnyAnswerConceptName("Still Birth","MTP","Abortion");

        complicationsBuilder
            .addComplication("Prolong labour")
            .when.valueInEnrolment('what kind of risk occurred')
            .containsAnswerConceptName("Prolong labour");

        complicationsBuilder
             .addComplication("LSCS")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("LSCS");

        complicationsBuilder
             .addComplication("ANEMIA")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("ANEMIA");
        
        complicationsBuilder
             .addComplication("ECLAMPSIA")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("ECLAMPSIA");
 
        complicationsBuilder
             .addComplication("PIH")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("PIH");
 
        complicationsBuilder
             .addComplication("SICKLE CELL")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("SICKLE CELL");
 
        complicationsBuilder
             .addComplication("APH")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("APH");
         
        complicationsBuilder
             .addComplication("MALPRESENTATION")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("MALPRESENTATION");
 
        complicationsBuilder
             .addComplication("TWINS")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("TWINS");
 
        complicationsBuilder
             .addComplication("BURNING MICTURATION")
             .when.valueInEnrolment('what kind of risk occurred')
             .containsAnswerConceptName("BURNING MICTURATION");
 


        return complicationsBuilder.getComplications();

 }

    static exec(programEnrolment, decisions, context, today) {
        decisions.enrolmentDecisions.push(PregnancyFormDecisionHandler.conditionDecisions(programEnrolment));
        return decisions;
 }

}

module.exports = {PregnancyEnrolmentViewFilterHandlerJNPCT,PregnancyFormDecisionHandler};

