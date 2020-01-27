import {complicationsBuilder as ComplicationsBuilder, ProgramRule} from 'rules-config/rules';
import moment from 'moment';
import _ from "lodash";

const has = 'containsAnyAnswerConceptName',
    inEnrolment = 'valueInEnrolment',
    latest = 'latestValueInAllEncounters',
    inEntireEnrolment = 'valueInEntireEnrolment';

@ProgramRule({
    name: 'child program summary',
    uuid: 'f3ec210e-74e8-4842-9b90-181b994c166e',
    programUUID: 'b54328b6-3e9a-4df7-915e-5b54cd772d43',
    executionOrder: 100.0,
    metadata: {}
})
class childProgramSummary {

    static exec(programEnrolment, summaries, context, today) {


        const muac = programEnrolment.findLatestObservationFromEncounters("Nutritional status of child");

        if (muac && muac.getReadableValue()) {
            summaries.push({name: 'MUAC', value: muac.getReadableValue()});
        }


        const weight = programEnrolment.findLatestObservationFromEncounters("Current Weight");
        if (weight && weight.getReadableValue()) {
            summaries.push({name: 'Weight', value: weight.getReadableValue()});
        }

        const height = programEnrolment.findLatestObservationInEntireEnrolment("Height");
        if (height && height.getReadableValue()) {
            summaries.push({name: 'Height', value: height.getReadableValue()});
        }

        const nutriStatus = programEnrolment.findLatestObservationFromEncounters("Current nutritional status according to weight and age");
        if (nutriStatus && nutriStatus.getReadableValue()) {
            summaries.push({name: 'Current Nutritional Status', value: nutriStatus.getReadableValue()});
        }



        return summaries;
    }
}

export {
    childProgramSummary
}
