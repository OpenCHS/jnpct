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


        const muac= programEnrolment.findLatestObservationFromEncounters("Nutritional status of child").getReadableValue();

        if (!_.isNil(muac)) {
            summaries.push({name: 'MUAC', value: muac});
        }



        const weight = programEnrolment.findLatestObservationFromEncounters("Current Weight").getReadableValue();
        if (!_.isNil(weight)) {
            summaries.push({name: 'Weight', value: weight});
        }

        const height = programEnrolment.findLatestObservationInEntireEnrolment("Height").getReadableValue();
        if (!_.isNil(height)) {
            summaries.push({name: 'Height', value: height});
        }

        const nutriStatus = programEnrolment.findLatestObservationFromEncounters("Current nutritional status according to weight and age").getReadableValue();
        if (!_.isNil(nutriStatus)) {
            summaries.push({name: 'Current Nutritional Status', value: nutriStatus});
        }



        return summaries;
    }
}

export {
    childProgramSummary
}
