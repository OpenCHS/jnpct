import {complicationsBuilder as ComplicationsBuilder, ProgramRule} from 'rules-config/rules';
import moment from 'moment';
import _ from "lodash";

const has = 'containsAnyAnswerConceptName',
    inEnrolment = 'valueInEnrolment',
    latest = 'latestValueInAllEncounters',
    inEntireEnrolment = 'valueInEntireEnrolment';

@ProgramRule({
    name: 'eligibleCouple program summary',
    uuid: '50bb0559-c7bb-4f07-886b-ae883465845f',
    programUUID: '4d56583f-76a7-4027-9d3d-6adc5a34a4b3',
    executionOrder: 100.0,
    metadata: {}
})
class eligibleCoupleProgramSummary {

    static exec(programEnrolment, summaries, context, today) {


        const height = programEnrolment.findLatestObservationFromEncounters("Height");
        const heightCount = height.getReadableValue();
        if (!_.isNil(heightCount)) {
            summaries.push({name: 'Height', value: heightCount});
        }

        const weight = programEnrolment.findLatestObservationFromEncounters("Weight");
        const weightCount = weight.getReadableValue();
        if (!_.isNil(weightCount)) {
            summaries.push({name: 'Weight', value: weightCount});
        }


        const muac = programEnrolment.findLatestObservationFromEncounters("MUAC (in cms)");
        const muacCount = muac.getReadableValue();
        if (!_.isNil(muacCount)) {
            summaries.push({name: 'MUAC', value: muacCount});
        }

        const lmp = programEnrolment.findLatestObservationInEntireEnrolment("LMP Date").getReadableValue();
        const lmpDate=moment(lmp).format('M-D-YYYY');
        if (!_.isNil(lmpDate)) {
            summaries.push({name: 'LMP', value: lmpDate});
        }


        return summaries;
    }
}

export {
    eligibleCoupleProgramSummary
}
