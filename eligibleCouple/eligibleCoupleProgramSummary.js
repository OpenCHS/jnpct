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
        if (height && height.getReadableValue()) {
            summaries.push({name: 'Height', value: height.getReadableValue()});
        }


        const we = programEnrolment.getObservationsForConceptName('Weight');
        if (!_.isEmpty(we)) {
            const value = we.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "weight", value: value})
        }


        const muac = programEnrolment.getObservationsForConceptName('MUAC (in cms)');
        if (!_.isEmpty(muac)) {
            const value = muac.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "MUAC", value: value})
        }

        const allEnc = _.filter(programEnrolment.nonVoidedEncounters(), enc => !_.isNil(enc.encounterDateTime));

        const latestEnc = _.last(_.sortBy(allEnc, encounter => encounter.encounterDateTime));
        const obs = latestEnc && _.find(latestEnc.observations, obs => obs.concept.name === 'LMP Date');
        if (!_.isNil(obs)) {
            const lmpDate=moment(obs.getReadableValue()).format('DD-MM-YYYY');
            summaries.push({name: 'LMP', value: lmpDate});
        }


        return summaries;
    }
}

export {
    eligibleCoupleProgramSummary
}
