import {complicationsBuilder as ComplicationsBuilder, ProgramRule} from 'rules-config/rules';
import moment from 'moment';
import _ from "lodash";


const has = 'containsAnyAnswerConceptName',
    inEnrolment = 'valueInEnrolment',
    latest = 'latestValueInAllEncounters',
    inEntireEnrolment = 'valueInEntireEnrolment';

@ProgramRule({
    name: 'pregnancy program summary',
    uuid: 'ca4415cf-d896-4d81-aa9d-1565df5de8b2',
    programUUID: '26d3e45e-7174-433f-b4a7-db1524648252',
    executionOrder: 100.0,
    metadata: {}
})
class ProgramSummary {
    static getHighRisks(programEnrolment) {
        const builder = new ComplicationsBuilder({
            programEnrolment: programEnrolment,
            individual: programEnrolment.individual,
            complicationsConcept: 'High Risk Conditions'
        });

        const add = builder.addComplication.bind(builder);
        add("Irregular weight gain")
            .when[latest]("Weight").lessThanOrEqualTo(35);
        add("Low BMI")
            .when[latest]("BMI").lessThan(18.5);
        add("High BMI")
            .when[latest]("BMI").greaterThan(24.9);
        add("Rh Negative Blood Group")
            .when[latest]("Blood Group").containsAnyAnswerConceptName("A-", "AB-", "O-", "B-");
        add("Pedal Edema Present")
            .when[latest]("pedal oedema is present").containsAnswerConceptName("Yes");
        add("Pallor Present")
            .when[latest]("Pallor").containsAnswerConceptName("Present");
        add("Hypertension")
            .when[latest]("B.P - Systolic").greaterThanOrEqualTo(140);
        add("Hypertension")
            .when[latest]("B.P - Diastolic").greaterThanOrEqualTo(90);
        add("High Temperature")
            .when[latest]("Temperature").greaterThan(37.5);
        add("Having convulsions")
            .when[latest]("Has she been having convulsions?").containsAnswerConceptName("Present");
        add("Jaundice (Icterus)")
            .when[latest]("Jaundice (Icterus)").containsAnswerConceptName("Present");
        add("Breast Examination -Nipple not normal")
            .when[latest]("Breast Examination - Nipple").containsAnyAnswerConceptName("Retracted", "Flat");
        add("Danger sign(s) present")
            .when[latest]("Is there any danger sign").containsAnyAnswerConceptName("Malaria", "eclampsia", "APH", "Foul smelling menses", "twin pregnancy",
            "fever", "difficult breathing", "severe vomiting", "problems in laboratory report",
            "Blurred vision", "Reduced fetal movement", "Other");
        add("High blood sugar")
            .when[latest]("Blood Sugar").is.greaterThanOrEqualTo(140);
        add("VDRL Postitve")
            .when[latest]("VDRL").containsAnswerConceptName("Positive");
        add("HIV/AIDS Positive")
            .when[latest]("HIV/AIDS Test").containsAnswerConceptName("Positive");
        add("HbsAg Positive")
            .when[latest]("HbsAg").containsAnswerConceptName("Positive");
        add("Sickle cell present")
            .when[latest]("IF YES, result of sickle cell test").containsAnyAnswerConceptName("DISEASE", "TRAIT");
        add("Sickle cell present")
            .when[latest]("IF YES, result of sickle cell test").containsAnyAnswerConceptName("DISEASE", "TRAIT");

        add("Urine Albumin present")
            .when[latest]("Urine Albumin").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4");

        add("Urine Sugar present")
            .when[latest]("Urine Sugar").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4");

        add("Number of foetus more than 1")
            .when[latest]("USG Scanning Report - Number of foetus").containsAnyAnswerConceptName("Two", "Three", "More than three");

        add("Liquour is not at normal level")
            .when[latest]("USG Scanning Report - Liquour").containsAnyAnswerConceptName("Increased", "Decreased");

        add("Placenta Previa present")
            .when[latest]("USG Scanning Report - Placenta Previa").containsAnyAnswerConceptName("Previa");

        add("Foetal presentation not Cephalic")
            .when[latest]("Foetal presentation").containsAnyAnswerConceptName("Transverse", "Breech");

        add("Foetal movements not normal")
            .when[latest]("Foetal movements").containsAnyAnswerConceptName("Absent", "Reduced");

        add("Severe Anemia")
            .when[latest]("H.B")
            .is.lessThanOrEqualTo(7);

        add("Moderate Anemia")
            .when[latest]("H.B")
            .is.greaterThanOrEqualTo(7.1)
            .and[latest]("H.B")
            .is.lessThanOrEqualTo(11);

        const complications = builder.getComplications();
        complications.abnormal = true;
        return complications;
    }

    static exec(programEnrolment, summaries, context, today) {
        const lmp = programEnrolment.findLatestObservationInEntireEnrolment("Last menstrual period").getReadableValue();

        var lmpDate = moment(lmp);
        var currentDate = moment();
        var months=currentDate.diff(lmpDate, 'months');

        if (!_.isNil(months)) {
            summaries.push({name: 'Pregnancy Month', value: months});
        }

        const highRisks = ProgramSummary.getHighRisks(programEnrolment, today);
        const conceptService = context.get('conceptService');
        highRisks.value = highRisks.value.map((name) => conceptService.conceptFor(name).uuid);
        if (highRisks.value.length) {
            summaries.push(highRisks);
        }


            const ironTab = programEnrolment.getObservationsForConceptName('IF YES THEN WRITE NUMBER OF TABLET SWALLOWED');
        if (!_.isEmpty(ironTab)) {
            const value = ironTab.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "Iron Tablet Consumed", value: value})
        }



        const calciumTab = programEnrolment.getObservationsForConceptName('IF YES THEN WRITE NUMBER OF CALCIUM TABLET SWALLOWED');
        if (!_.isEmpty(calciumTab)) {
            const value = calciumTab.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "Calcium Tablet Consumed", value: value})
        }

        const sickleCellTest = programEnrolment.findLatestObservationFromEncounters("IF YES, result of sickle cell test");
        const sickleCellTestResult = sickleCellTest && sickleCellTest.getReadableValue();
        if (!_.isNil(sickleCellTestResult)) {
            summaries.push({name: 'Sickle Cell Result', value: sickleCellTestResult});
        }

        const hb = programEnrolment.getObservationsForConceptName('H.B');
        if (!_.isEmpty(hb)) {
            const value = hb.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "HB", value: value})
        }

        const bpSystolic = programEnrolment.getObservationsForConceptName("B.P - Systolic");
        console.log('+=====>sys',bpSystolic);

        const bpDiastolic = programEnrolment.getObservationsForConceptName("B.P - Diastolic"); 
        console.log('+=====>diq',bpDiastolic);

        if (!_.isEmpty(bpSystolic) && !_.isEmpty(bpDiastolic)) {            
            var value = [];
            bpSystolic.forEach(element => {
                let display = moment(element.encounterDateTime).format("DD-MM-YYYY") + ': ' + element.obs; 
                value.push(display);
            });
            bpDiastolic.forEach(element => {
                for (var i = 0; i < bpSystolic.length ; i++) {                    
                    if(_.isEqual(bpSystolic[i].encounterDateTime, element.encounterDateTime)){
                        let display =  value[i] + '|' + element.obs;
                        value[i] = display;
                    } 
                    // else {        
                        // const e = _.find(bpDiastolic, function(e) { return !_.isEqual(bpSystolic[i].encounterDateTime, e.encounterDateTime); });       
                        // if(!_.isEmpty(e)){
                        // let display = moment(e.encounterDateTime).format("DD-MM-YYYY") + ': -- | ' + e.obs; 
                        // if(!value.includes(display)) value.push(display);
                        // }
                        
                        // const e1 = _.find(bpSystolic, function(e) { return !_.isEqual(bpDiastolic[i].encounterDateTime, e.encounterDateTime); });       
                        // if(!_.isEmpty(e1)){
                        // let display =  value[i] + '| --'; 
                        // value[i] = display;
                        // }
                    // }
                }               
            });

            summaries.push({name: "Blood Pressure", value: value})
        }

        const muacCount = programEnrolment.getObservationsForConceptName('MUAC (in cms)');
        if (!_.isEmpty(muacCount)) {
            const value = muacCount.map(({encounterDateTime, obs}) => (`${moment(encounterDateTime).format("DD-MM-YYYY")}: ${obs}`))
                .join(", ");
            summaries.push({name: "MUAC", value: value})

        }


        return summaries;
    }
}

export {
    ProgramSummary
}
