import moment from 'moment';
import {RuleFactory} from 'rules-config/rules';
import RuleHelper from "./RuleHelper";
import lib from './lib';
import _ from 'lodash';
import { program } from '@babel/template';
import { whileStatement } from '@babel/types';

const hasExitedProgram = programEncounter => programEncounter.programEnrolment.programExitDateTime;

const getEarliestDate = (programEnrolment) =>
    moment(programEnrolment.enrolmentDateTime)
        .startOf("day")
        .toDate();

const getEarliestEncounterDate = (programEncounter) =>
    moment(programEncounter.earliestVisitDateTime)
        .startOf("day")
        .toDate();


const getEarliestECFollowupDate = (eventDate) => {
            return moment(eventDate).add(2, 'months').toDate();
        };

        const encounterSchedule = {
            "ANC 2": {earliest: 168, max: 197},
            "ANC 3": {earliest: 203, max: 253},
            "PNC 2": {earliest: 28, max: 36},
            "PNC 3": {earliest: 50, max: 61},
            "Abortion Followup Visit-2": {earliest: 28, max: 36},
            "Abortion Followup Visit-3": {earliest: 50, max: 61},
            "Child PNC 2": {earliest: 28, max: 36},
            "Child PNC 3": {earliest: 50, max: 61}
            // "Eligible Couple Followup": {earliest: 51, max: 65}
        };

        const encounterScheduleHighRisk = {
            "ANC 2": {earliest: 112, max: 123},
            "ANC 3": {earliest: 168, max: 179},
            "ANC 4": {earliest: 196, max: 207},
            "ANC 5": {earliest: 224, max: 235},
            "ANC Cluster Incharge-1": {earliest: 148, max: 169},
            "ANC Cluster Incharge-2": {earliest: 204, max: 225},    
        };

        const encounterScheduleChildFollowup =[
            {"name" : "Child Followup-1","earliest": 110,"max" : 10},
            {"name" : "Child Followup-2","earliest": 160,"max" : 8}
        ];

        const encounterScheduleANCClusterIncharge =[
            {"name" : "ANC Cluster Incharge-1","earliest": 148,"max" : 169},
            {"name" : "ANC Cluster Incharge-2","earliest": 204,"max" : 225}
        ];

        const encounterScheduleChildPNC =[
            {"name" : "Child PNC 2","earliest": 28,"max" : 36},
            {"name" : "Child PNC 3","earliest": 50,"max" : 61}
        ];

        const encounterScheduleChildFollowupCluster = [
            {"name" : "Child Followup Cluster Incharge-1","earliest": 99,"max" : 113},
            {"name" : "Child Followup Cluster Incharge-2","earliest": 155,"max" : 169}
        ];

        //  const encounterScheduleChildPNCLowBirthWeight =[
        //     {"name" : "Child PNC 2","earliest": 7,"max" : 11}
        // ];

          // const encounterScheduleANC =[
        //     {"name" : "ANC 2","earliest": 168,"max" : 197},
        //     {"name" : "ANC 3","earliest": 203,"max" : 253}
        // ];

         // const encounterScheduleANC =[
        //     {"name" : "ANC 2","earliest": 168,"max" : 197},
        //     {"name" : "ANC 3","earliest": 203,"max" : 253}
        // ];

        // const encounterScheduleHighRisk =[
        //     {"name" : "ANC 2","earliest": 112,"max" : 123},
        //     {"name" : "ANC 3","earliest": 168,"max" : 179},
        //     {"name" : "ANC 4","earliest": 196,"max" : 207},
        //     {"name" : "ANC 5","earliest": 224,"max" : 235},
        // ];

        const scheduleVisitsDuringECFollowup = (programEncounter, scheduleBuilder) => {
              const isPregnant = programEncounter.getObservationReadableValue('Is She Pregnant?');
                if(!_.isEqual(isPregnant,'Yes') && !hasExitedProgram(programEncounter)){
                    scheduleBuilder.add({
                        name: 'Eligible Couple Followup',
                        encounterType: 'Eligible Couple Followup',
                        earliestDate: getEarliestECFollowupDate(programEncounter.earliestVisitDateTime),
                        maxDate: lib.C.addDays(getEarliestECFollowupDate(programEncounter.earliestVisitDateTime), 15)
                        });  
                }
            return ;
        }

        const scheduleVisitsDuringAbortionFollowup = (programEncounter, scheduleBuilder) => {
            const abortionDate = programEncounter.programEnrolment
            .getObservationReadableValueInEntireEnrolment('Date of Abortion/MTP');
            var schedule = [];

        // const programNames = [];
        // const enrolments = programEncounter.programEnrolment.individual.enrolments;
        // enrolments.forEach(e => programNames.push(e.program.operationalProgramName || e.program.name));
        // console.log('programNames',programNames);
        
        const addEncounter = function (baseDate, encounterType, name) {        
            if (programEncounter.programEnrolment.hasEncounter(encounterType, name)) return;  
            schedule = encounterSchedule[name === undefined ? encounterType : name];
            // console.log('abortionDate schedule',schedule);

            scheduleBuilder.add({
                                name: name,
                                encounterType: encounterType,
                                earliestDate: lib.C.addDays(baseDate, schedule.earliest),
                                maxDate:lib.C.addDays(baseDate, schedule.max)
                                });  
        };
         
        if (!hasExitedProgram(programEncounter)){         
        if (abortionDate) {
            if (programEncounter.name === 'Abortion Followup Visit-1') 
            addEncounter(abortionDate, 'Abortion Followup', 'Abortion Followup Visit-2');
            else if (programEncounter.name === 'Abortion Followup Visit-2') 
            addEncounter(abortionDate, 'Abortion Followup', 'Abortion Followup Visit-3');   
            //    else if (programEncounter.name === 'Abortion Followup Visit-3' && lib.C.contains(programNames,'Eligible couple')) 
            //    addEncounter(abortionDate, 'Eligible Couple Followup', 'Eligible Couple Followup'); 
            }    
        }
            return;
        }

        const scheduleVisitsDuringANC = (programEncounter, scheduleBuilder) => {
            const lmpDate = programEncounter.programEnrolment.getObservationValue('Last menstrual period');
            const highRiskANC = programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('High Risk Conditions');
            // const encounters = [];
            var schedule = [];

            const addEncounter = function (baseDate, encounterType, name) {    
                if (programEncounter.programEnrolment.hasEncounter(encounterType, name)) return;           
                if(highRiskANC){
                    schedule = encounterScheduleHighRisk[name === undefined ? encounterType : name];
                } else {
                    schedule = encounterSchedule[name === undefined ? encounterType : name];
                }
                scheduleBuilder.add({
                    name: name,
                    encounterType: encounterType,
                    earliestDate: lib.C.addDays(baseDate, schedule.earliest),
                    maxDate:lib.C.addDays(baseDate, schedule.max)
                    });  
            };

            if (!hasExitedProgram(programEncounter)){             
           
                if (programEncounter.name === 'ANC 1') 
                    addEncounter(lmpDate, 'ANC', 'ANC 2');
                else if (programEncounter.name === 'ANC 2') 
                    addEncounter(lmpDate, 'ANC', 'ANC 3'); 
                else if (programEncounter.name === 'ANC 3' && highRiskANC)
                    addEncounter(lmpDate, 'ANC', 'ANC 4'); 
                else if (programEncounter.name === 'ANC 4' && highRiskANC)
                    addEncounter(lmpDate, 'ANC', 'ANC 5');            
            
                if (highRiskANC){
                    const encounter = _.forEach(encounterScheduleANCClusterIncharge, 
                        e => moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(lmpDate, e.earliest)),'date'));
                        
                        if(!_.isEmpty(encounter)){
                            const filteredEncounter = _.filter(encounter, 
                                e => (programEncounter.programEnrolment.hasEncounter('ANC Cluster Incharge', e.name))  === false);
                            
                        if(!_.isEmpty(filteredEncounter)){
                            schedule = filteredEncounter[0];
                            addEncounter(lmpDate, 'ANC Cluster Incharge' ,schedule.name);
                }
            }
        }
    }

        return ;
        }

        const scheduleVisitsDuringANCClusterIncharge = (programEncounter, scheduleBuilder) => {
            const lmpDate = programEncounter.programEnrolment.getObservationValue('Last menstrual period');
            const highRiskANC = programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('High Risk Conditions');
            var schedule = [];

            if (!hasExitedProgram(programEncounter)){
            
                if (highRiskANC){
                    const encounter = _.forEach(encounterScheduleANCClusterIncharge, 
                        e => moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(lmpDate, e.earliest)),'date'));
                        
                        if(!_.isEmpty(encounter)){
                            const filteredEncounter = _.filter(encounter, 
                                e => (programEncounter.programEnrolment.hasEncounter('ANC Cluster Incharge', e.name))  === false);
                            
                        if(!_.isEmpty(filteredEncounter)){
                            schedule = filteredEncounter[0];
                            console.log('schedule',schedule.name);
                            scheduleBuilder.add({
                                name: schedule.name,
                                encounterType: 'ANC Cluster Incharge',
                                earliestDate: lib.C.addDays(lmpDate, schedule.earliest),
                                maxDate: lib.C.addDays(lmpDate, schedule.max)
                                }); 
                }
            }
        }
    }

        return ;
        }

      
        const scheduleVisitsDuringPNC = (programEncounter, scheduleBuilder) => {
            const deliveryDate = programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('Date of delivery');
             var schedule = [];
        
            // const programNames = [];
            // const enrolments = programEncounter.programEnrolment.individual.enrolments;
            // enrolments.forEach(e => programNames.push(e.program.operationalProgramName || e.program.name));
            // console.log('programNames',programNames);
      
            const addEncounter = function (baseDate, encounterType, name) {        
                if (programEncounter.programEnrolment.hasEncounter(encounterType, name)) return;  
                schedule = encounterSchedule[name === undefined ? encounterType : name];
                      scheduleBuilder.add({
                        name: name,
                        encounterType: encounterType,
                        earliestDate: lib.C.addDays(baseDate, schedule.earliest),
                        maxDate:lib.C.addDays(baseDate, schedule.max)
                        });      
            };

            if (!hasExitedProgram(programEncounter)){             
            if (deliveryDate) {
                if (programEncounter.name === 'PNC 1') 
                addEncounter(deliveryDate, 'PNC', 'PNC 2');
                else if (programEncounter.name === 'PNC 2') 
                addEncounter(deliveryDate, 'PNC', 'PNC 3');   
                // else if (programEncounter.name === 'PNC 3' && lib.C.contains(programNames,'Eligible couple')) 
                //    addEncounter(abortionDate, 'Eligible Couple Followup', 'Eligible Couple Followup'); 
                }
            }
            return ;
        }

        const scheduleVisitsDuringChildPNC = (programEncounter, scheduleBuilder) => {
            const birthWeight = programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('Birth Weight')
            || programEncounter.getObservationReadableValue('Birth Weight');
            const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths(); 
            const nutritionalStatus = programEncounter.getObservationReadableValue('Nutritional status of child')
            || programEncounter.getObservationReadableValue('Current nutritional status according to weight and age');
         
            if (!hasExitedProgram(programEncounter)){                  
                console.log('birthWeight',birthWeight);
            if(birthWeight >= 2){
                 scheduleChildPNCVisitsNormal(programEncounter, scheduleBuilder);
            } else if(birthWeight < 2 && ageOfChildInMonths < 2)
                  scheduleChildPNCVisitsLowBirthWeight(programEncounter, scheduleBuilder);
          
            if ( !_.isEqual(nutritionalStatus,'Normal') && ageOfChildInMonths >= 2 && ageOfChildInMonths <= 6)
                scheduleChildFollowupClusterInchargeVisits(programEncounter, scheduleBuilder);            
          }
            return ;
        }

        const scheduleChildPNCVisitsLowBirthWeight =(programEncounter, scheduleBuilder) =>{
            if(programEncounter.programEnrolment.hasEncounter('Birth Form','Birth Form')){
            const birthEncounterDate = programEncounter.programEnrolment.findEncounter('Birth Form','Birth Form').earliestVisitDateTime;
                // console.log('birthEncounterDate',birthEncounterDate);              
            
            let earliestOffset = 7;
            let visitCount = 0;
            do {
                visitCount ++;
                earliestOffset = 7* visitCount;
                console.log('lib.C.addDays(birthEncounterDate, earliestOffset)',lib.C.addDays(birthEncounterDate, earliestOffset));
                console.log('while is ', !moment(programEncounter.earliestVisitDateTime).isSameOrBefore(lib.C.addDays(birthEncounterDate, earliestOffset)),'date');
            } while (!(moment(programEncounter.earliestVisitDateTime).isSameOrBefore(lib.C.addDays(birthEncounterDate, earliestOffset)),'date'));

                RuleHelper.addSchedule(scheduleBuilder, 'Child PNC','Child PNC',lib.C.addDays(birthEncounterDate, earliestOffset) ,4); 
            }                
             return;
        }

        const scheduleChildPNCVisitsNormal = (programEncounter, scheduleBuilder) =>{
            const birthDate = programEncounter.programEnrolment.individual.dateOfBirth;
            const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
            var schedule = [];        

            const encounter = _.forEach(encounterScheduleChildPNC, 
                e => moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(birthDate, e.earliest)),'date'));
            
            if(!_.isEmpty(encounter)){
                const filteredEncounter = _.filter(encounter, 
                    e => (programEncounter.programEnrolment.hasEncounter('Child PNC', e.name))  === false);
                
                if(!_.isEmpty(filteredEncounter)){
                schedule = filteredEncounter[0];
                console.log('schedule',schedule.name);
                scheduleBuilder.add({
                    name: schedule.name,
                    encounterType: 'Child PNC',
                    earliestDate: lib.C.addDays(birthDate, schedule.earliest),
                    maxDate: lib.C.addDays(birthDate, schedule.max)
                    }); 
                }
            }else if (programEncounter.name === 'Child PNC 3' && ageOfChildInMonths <= 6) {
                    if (programEncounter.programEnrolment.hasEncounter('Child Followup', 'Child Followup-1')) return; 
                    else RuleHelper.addSchedule(scheduleBuilder, 'Child Followup-1','Child Followup',lib.C.addDays(birthDate, 110),10);
                } 
            return;
        }

        const scheduleChildFollowupClusterInchargeVisits =  (programEncounter, scheduleBuilder) => {
            const birthDate = programEncounter.programEnrolment.individual.dateOfBirth;
            var schedule = [];

            const encounter = _.forEach(encounterScheduleChildFollowupCluster, 
                e => moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(birthDate, e.earliest)),'date'));
            
            if(!_.isEmpty(encounter)){
                const filteredEncounter = _.filter(encounter, 
                    e => (programEncounter.programEnrolment.hasEncounter('Child Followup Cluster Incharge', e.name))  === false);
                
                if(!_.isEmpty(filteredEncounter)){
                schedule = filteredEncounter[0];
                console.log('schedule',schedule.name);
                scheduleBuilder.add({
                    name: schedule.name,
                    encounterType: 'Child Followup Cluster Incharge',
                    earliestDate: lib.C.addDays(birthDate, schedule.earliest),
                    maxDate: lib.C.addDays(birthDate, schedule.max)
                    }); 
                }
            }
            return;
        }

        const scheduleFollowupVisitsDuringFollowup = (programEncounter, scheduleBuilder) => {
            const birthDate = programEncounter.programEnrolment.individual.dateOfBirth;
            var schedule = [];

            const encounter = _.forEach(encounterScheduleChildFollowup, 
                e => moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(birthDate, e.earliest)),'date'));
            
            if(!_.isEmpty(encounter)){
                const filteredEncounter = _.filter(encounter, 
                    e => (programEncounter.programEnrolment.hasEncounter('Child Followup', e.name))  === false);
                
                if(!_.isEmpty(filteredEncounter)){
                schedule = filteredEncounter[0];
                console.log('schedule',schedule.name);
                scheduleBuilder.add({
                    name: schedule.name,
                    encounterType: 'Child Followup',
                    earliestDate: lib.C.addDays(birthDate, schedule.earliest),
                    maxDate: lib.C.addDays(birthDate, schedule.max)
                    }); 
                }
            }
            return;
        }

        const scheduleVisitsDuringChildFollowupNormal = (programEncounter, scheduleBuilder) => {
            const birthDate = programEncounter.programEnrolment.individual.dateOfBirth;
            const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
                  
            if (!hasExitedProgram(programEncounter)){                            
            if( ageOfChildInMonths <= 24){ //ageOfChildInMonths >= 7 &&
                let earliestOffset = 135;
                let visitCount = 0;
                do {
                    visitCount = visitCount + 90;
                    earliestOffset = earliestOffset + visitCount ;
                } while (!(moment(programEncounter.earliestVisitDateTime).
                isSameOrBefore(lib.C.addDays(birthDate, earliestOffset),'date')));
               
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                    lib.C.addDays(birthDate, earliestOffset) ,15);

            }else if( ageOfChildInMonths <= 60){ //ageOfChildInMonths >= 24 &&
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                lib.C.addMonths(getEarliestEncounterDate(programEncounter), 4) ,15);   
             }
            }
            return ;
        }

        const scheduleVisitsDuringChildFollowupSAM = (programEncounter, scheduleBuilder) => {
           const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
           console.log('scheduleVisitsDuringChildFollowupSAM',ageOfChildInMonths);
            if (!hasExitedProgram(programEncounter)){                            
            if( ageOfChildInMonths <= 24){ //ageOfChildInMonths >= 7 &&
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                lib.C.addDays(getEarliestEncounterDate(programEncounter), 15) ,15);   
            }else if( ageOfChildInMonths <= 60){ //ageOfChildInMonths >= 24 &&
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                lib.C.addMonths(getEarliestEncounterDate(programEncounter), 1) ,15);   
             }
           
             if(!programEncounter.programEnrolment.hasEncounter('Child Followup Cluster Incharge','Child Followup Cluster Incharge-1')
                && ageOfChildInMonths >= 7 && ageOfChildInMonths <= 60)
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup Cluster Incharge-1','Child Followup Cluster Incharge', 
                    lib.C.addMonths(getEarliestEncounterDate(programEncounter), 1) ,8);   
           }
            return ;
        }

        const scheduleVisitsDuringChildFollowupMAM = (programEncounter, scheduleBuilder) => {
            const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
       
            if (!hasExitedProgram(programEncounter)){                            
            if( ageOfChildInMonths <= 24){ // ageOfChildInMonths >= 7 &&  
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                lib.C.addMonths(getEarliestEncounterDate(programEncounter), 1) ,15);   
            }else if( ageOfChildInMonths <= 60){//ageOfChildInMonths >= 24 &&
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
                lib.C.addMonths(getEarliestEncounterDate(programEncounter), 2) ,15);   
             }
            
             if(!programEncounter.programEnrolment.hasEncounter('Child Followup Cluster Incharge','Child Followup Cluster Incharge-1')
               && ageOfChildInMonths >= 7 && ageOfChildInMonths <= 60)
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup Cluster Incharge-1','Child Followup Cluster Incharge', 
                    lib.C.addMonths(getEarliestEncounterDate(programEncounter), 4) ,8);   
            }
            return ;
        }

        const scheduleVisitsDuringChildPNCClusterIncharge = (programEncounter, scheduleBuilder) => {
            const birthDate = programEncounter.programEnrolment.individual.dateOfBirth;
           
            if(programEncounter.programEnrolment.hasEncounter('Child PNC Cluster Incharge','Child PNC Cluster Incharge-1')
               && (moment(programEncounter.earliestVisitDateTime).isSameOrBefore(lib.C.addDays(birthDate, 61)),'date'));               
                RuleHelper.addSchedule(scheduleBuilder, 'Child PNC Cluster Incharge-2','Child PNC Cluster Incharge', 
                    lib.C.addDays(birthDate, 47) ,14);   
            

            return;
        }

        const scheduleVisitsDuringChildFollowup = (programEncounter, scheduleBuilder) => {
            const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();
           
            const nutritionalStatus = programEncounter.getObservationReadableValue('Nutritional status of child')
            || programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('Nutritional status of child')
            || programEncounter.getObservationReadableValue('Current nutritional status according to weight and age');
            
             if( ageOfChildInMonths < 6) {             
                scheduleFollowupVisitsDuringFollowup(programEncounter,scheduleBuilder); 
                if(!_.isEqual(nutritionalStatus,'Normal'))
                   scheduleChildFollowupClusterInchargeVisits(programEncounter, scheduleBuilder);            
            } 
            // else {            
                    console.log('nutritionalStatus switch ',nutritionalStatus);
                switch(nutritionalStatus) {
                    case 'Normal':
                        scheduleVisitsDuringChildFollowupNormal(programEncounter,scheduleBuilder);
                    break;
                    case 'SAM' : 
                        scheduleVisitsDuringChildFollowupSAM(programEncounter,scheduleBuilder);
                    break;
                    case 'Severely Underweight': //
                        scheduleVisitsDuringChildFollowupSAM(programEncounter,scheduleBuilder);
                    break;
                    case 'MAM' :  //
                        scheduleVisitsDuringChildFollowupMAM(programEncounter,scheduleBuilder);
                    break;
                    case 'Moderately Underweight':  //
                        scheduleVisitsDuringChildFollowupMAM(programEncounter,scheduleBuilder);
                    break;
            }
        // }
          return ;
    }

      const schedulePNCVisitsDuringBirth = (programEncounter, scheduleBuilder) =>{
        const birthDate = programEncounter.programEnrolment.individual.dateOfBirth; 
 
        if(moment(programEncounter.earliestVisitDateTime).isSameOrBefore(moment(lib.C.addDays(birthDate, 8)),'date')
            && !(programEncounter.programEnrolment.hasEncounter('Child PNC', 'Child PNC 1'))){ 
                console.log('getEarliestEncounterDate(programEncounter)',getEarliestEncounterDate(programEncounter));
            scheduleBuilder.add({
                name: 'Child PNC 1',
                encounterType: 'Child PNC',
                earliestDate: getEarliestEncounterDate(programEncounter),
                maxDate:lib.C.addDays(birthDate, 8)
                });  
        }else        
              scheduleChildPNCVisitsNormal(programEncounter, scheduleBuilder);
    
        return ;
      }


      const scheduleVisitsDuringBirth = (programEncounter, scheduleBuilder) => {    
        let birthWeight = programEncounter.programEnrolment.getObservationReadableValueInEntireEnrolment('Birth Weight')
        || programEncounter.getObservationReadableValue('Birth Weight');
        const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
         
        if (birthWeight < 2 ){  
            if (ageOfChildInMonths < 2) {         
                    RuleHelper.addSchedule(scheduleBuilder, 'Child PNC','Child PNC', 
                    getEarliestEncounterDate(programEncounter) ,4);
           
                    RuleHelper.addSchedule(scheduleBuilder, 'Child PNC Cluster Incharge-1','Child PNC Cluster Incharge', 
                    getEarliestEncounterDate(programEncounter),8);
    
         } else schedulePNCVisitsDuringBirth(programEncounter, scheduleBuilder);
        }
   
      return ;
  }

  const scheduleANCClusterInchargeVisits = (programEnrolment,scheduleBuilder) =>{
    const lmpDate = programEnrolment.getObservationValue('Last menstrual period');
    var schedule = [];

            const encounter = _.forEach(encounterScheduleANCClusterIncharge, 
                e => moment(getEarliestDate(programEnrolment)).isSameOrBefore(moment(lib.C.addDays(lmpDate, e.earliest)),'date'));
            
            if(!_.isEmpty(encounter)){
                const filteredEncounter = _.filter(encounter, 
                    e => (programEnrolment.hasEncounter('ANC Cluster Incharge', e.name))  === false);
                
                if(!_.isEmpty(filteredEncounter)){
                schedule = filteredEncounter[0];
                console.log('schedule',schedule.name);
                scheduleBuilder.add({
                    name: schedule.name,
                    encounterType: 'ANC Cluster Incharge',
                    earliestDate: lib.C.addDays(lmpDate, schedule.earliest),
                    maxDate: lib.C.addDays(lmpDate, schedule.max)
                    }); 
                }
            }
      return;
  }

const scheduleVisitsDuringChildFollowupClusterIncharge = (programEncounter,scheduleBuilder) =>{
    const nutritionalStatus = programEncounter.getObservationReadableValue('Nutritional status of child');
    const ageOfChildInMonths = programEncounter.programEnrolment.individual.getAgeInMonths();   
       if(!hasExitedProgram(programEncounter) && nutritionalStatus && !nutritionalStatus.isEqual('Normal')){
       if ( ageOfChildInMonths > 2 && ageOfChildInMonths < 6)
            scheduleChildFollowupClusterInchargeVisits(programEncounter, scheduleBuilder);
       else if(ageOfChildInMonths <= 60 )
       switch(nutritionalStatus) {
           case 'SAM' : 
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup Cluster Incharge-2','Child Followup Cluster Incharge', 
                 lib.C.addMonths(getEarliestEncounterDate(programEncounter), 1) ,8);   
          break;
           case 'MAM' :
                RuleHelper.addSchedule(scheduleBuilder, 'Child Followup Cluster Incharge-2','Child Followup Cluster Incharge', 
                   lib.C.addMonths(getEarliestEncounterDate(programEncounter), 4) ,8);   
          break;
        
   }
}
    return;
}


@RuleFactory("d40e8aa2-8cae-4b09-ad30-2da6c1690206", "VisitSchedule")
("3d13cc9a-c1fe-49e9-8980-360378f8199d", "JNPCT Pregnant Woman Enrolment Visit schedule", 100.0)
class ScheduleVisitDuringPregnantWomanEnrolment {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        let enrolmentHighRisk = programEnrolment.getObservationValue('High Risk');
        let maxDateOffset = 15;
        if (enrolmentHighRisk){ 
            maxDateOffset = 8;
            scheduleANCClusterInchargeVisits(programEnrolment,scheduleBuilder);  
        }
      
        RuleHelper.addSchedule(scheduleBuilder, 'ANC 1','ANC', getEarliestDate(programEnrolment), maxDateOffset);
        // .enrolmentDateTime
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("0b37b679-a33f-42b3-a455-a84eaea7b5d8", "VisitSchedule")
("0f481c77-ffb2-46ee-9b93-8de09e0074c7", "JNPCT Eligible Couple Enrolment Visit schedule", 100.0)
class ScheduleVisitDuringEligibleCoupleEnrolment {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
        RuleHelper.addSchedule(scheduleBuilder, 'Eligible Couple Followup','Eligible Couple Followup', 
        getEarliestECFollowupDate(programEnrolment.enrolmentDateTime), 15);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("cbe0f44c-580a-4311-ae34-cef2e4b35330", "VisitSchedule")
("e0a84446-c388-4ce6-b740-a949ffff6c42", "JNPCT PNC Visit schedule", 100.0)
class ScheduleVisitDuringDelivery {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);      
        const deliveryDate = programEncounter.getObservationValue('Date of delivery');
        RuleHelper.addSchedule(scheduleBuilder, 'PNC 1','PNC', deliveryDate, 8);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("6ff66edf-30c9-49c5-821c-c44f371b31b2", "VisitSchedule")
("d4094b19-69f6-4c7c-8c8d-c3c15586878d", "JNPCT Abortion Followup Visit schedule", 100.0)
class ScheduleVisitDuringAbortion {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);      
        const abortionDate = programEncounter.getObservationValue('Date of Abortion/MTP');
        RuleHelper.addSchedule(scheduleBuilder, 'Abortion Followup Visit-1','Abortion Followup', abortionDate, 8);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("9bf17b07-3e6b-414a-a96e-086fc9c5ef6a", "VisitSchedule")
("f3c6201c-d800-4db9-92cc-f1151afa718b", "ScheduleVisitsDuringANC", 10.0)
class ScheduleVisitsDuringANC {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) { 
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          
        scheduleVisitsDuringANC(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("ac8f3477-6841-4a22-99fe-8467b0e311d0", "VisitSchedule")
("da4ef295-1b64-4b22-91e5-8ad78652bef0", "ScheduleVisitsDuringANCClusterIncharge", 10.0)
class ScheduleVisitsDuringANCClusterIncharge {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) { 
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          
        scheduleVisitsDuringANCClusterIncharge(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("c4123189-c7b6-49e1-bbf3-82b3127750b2", "VisitSchedule")
("c66ae70a-b5d0-42a0-8b61-293169de26d0", "ScheduleVisitsDuringPNC", 10.0)
class ScheduleVisitsDuringPNC {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {    
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          
        scheduleVisitsDuringPNC(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("20e3c4e9-1e58-4a11-ba5c-9f3c745c7ef7", "VisitSchedule")
("64e95c2f-e754-44fe-81d4-2c9289e0da16", "ScheduleVisitsDuringAbortionFollowup", 10.0)
class ScheduleVisitsDuringAbortionFollowup {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {   
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          
        scheduleVisitsDuringAbortionFollowup(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("1c8bd246-f46e-4250-88bc-1ca567ba03ce", "VisitSchedule")
("c96af83f-5f11-4b6a-92c3-2dcd4b0341c4", "ScheduleVisitsDuringECFollowup", 10.0)
class ScheduleVisitsDuringECFollowup {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          
        scheduleVisitsDuringECFollowup(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("95796c7b-cb70-48f5-893f-c0c8afbc3785", "VisitSchedule")
("35edab3b-2254-40c1-b5d1-c3f11cf29234", "ScheduleVisitDuringChildEnrolment", 100.0)
class ScheduleVisitDuringChildEnrolment {
    static exec(programEnrolment, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createEnrolmentScheduleBuilder(programEnrolment, visitSchedule);
       
        const dob = programEnrolment.individual.dateOfBirth;
        const ageOfChildInDays = lib.C.getDays(dob,programEnrolment.enrolmentDateTime); 
        if (ageOfChildInDays < 90)
        RuleHelper.addSchedule(scheduleBuilder, 'Birth Form','Birth Form', getEarliestDate(programEnrolment), 0);
        else {
            RuleHelper.addSchedule(scheduleBuilder, 'Child Followup','Child Followup', 
            getEarliestDate(programEnrolment),0);
        }
        return scheduleBuilder.getAllUnique("encounterType");
    }
}

@RuleFactory("f410de41-c0cc-4bac-a5a2-2e98d10572e9", "VisitSchedule")
("fea5a152-b641-452a-b129-7030a07c36ac", "ScheduleVisitsDuringBirth", 10.0)
class ScheduleVisitsDuringBirth {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        scheduleVisitsDuringBirth(programEncounter,scheduleBuilder); 
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("62b5b7ae-f0b3-49c0-b7cb-eb2b616bc89b", "VisitSchedule")
("c65285b0-bfc4-440c-b24d-356c2d499587", "ScheduleVisitsDuringChildPNC", 10.0)
class ScheduleVisitsDuringChildPNC {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        scheduleVisitsDuringChildPNC(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("cd1c6c33-1f90-41dc-aa97-dc2ba3ae65b7", "VisitSchedule")
("fce4418e-18dc-48b1-b1b3-8aaa52280241", "ScheduleVisitsDuringChildPNCClusterIncharge", 10.0)
class ScheduleVisitsDuringChildPNCClusterIncharge {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        scheduleVisitsDuringChildPNCClusterIncharge(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("4548364c-ff22-447b-baec-3c63935a7e00", "VisitSchedule")
("bd87c77a-e202-4b9d-a756-caacc1f6bf86", "ScheduleVisitsDuringChildFollowup", 10.0)
class ScheduleVisitsDuringChildFollowup {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        scheduleVisitsDuringChildFollowup(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("80f09382-c97b-4850-9c9e-b834e0a6f501", "VisitSchedule")
("cfa84a61-3916-40b6-a8fe-3dbf8950eb3f", "ScheduleVisitsDuringChildFollowupClusterIncharge", 10.0)
class ScheduleVisitsDuringChildFollowupClusterIncharge {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {       
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);
        scheduleVisitsDuringChildFollowupClusterIncharge(programEncounter,scheduleBuilder);
        return scheduleBuilder.getAllUnique("encounterType");
   }
}

@RuleFactory("406738d4-c96c-498c-99e7-4389cb454d5c", "VisitSchedule")
("aa7e471c-60fe-43f2-973b-454b0acd8b2a", "ScheduleVisitsOnCancel", 10.0)
class ScheduleVisitsOnCancel {
    static exec(programEncounter, visitSchedule = [], scheduleConfig) {
        let scheduleBuilder = RuleHelper.createProgramEncounterVisitScheduleBuilder(programEncounter, visitSchedule);          

        if (!hasExitedProgram(programEncounter)) {
            switch(programEncounter.encounterType.name) {
                case 'Eligible Couple Followup':
                    scheduleVisitsDuringECFollowup(programEncounter, scheduleBuilder);
                    break;
                case 'Abortion Followup':
                    scheduleVisitsDuringAbortionFollowup(programEncounter, scheduleBuilder);
                    break;
                case 'ANC':
                    scheduleVisitsDuringANC(programEncounter, scheduleBuilder);
                    break;
                case 'ANC Cluster Incharge':
                    scheduleVisitsDuringANCClusterIncharge(programEncounter, scheduleBuilder);
                    break;    
                case 'PNC':
                    scheduleVisitsDuringPNC(programEncounter, scheduleBuilder);
                    break; ;
                case 'Birth Form':
                    scheduleVisitsDuringBirth(programEncounter,scheduleBuilder);
                    break;   
                case 'Child PNC':
                    scheduleVisitsDuringChildPNC(programEncounter,scheduleBuilder);     
                    break;
                case 'Child PNC Cluster Incharge':
                    scheduleVisitsDuringChildPNCClusterIncharge(programEncounter,scheduleBuilder);     
                    break;
                case 'Child Followup':
                    scheduleVisitsDuringChildFollowup(programEncounter,scheduleBuilder);
                    break;
                case 'Child Followup Cluster Incharge':
                    scheduleVisitsDuringChildFollowupClusterIncharge(programEncounter,scheduleBuilder);
                    break;       
            }
        }
        return scheduleBuilder.getAllUnique("encounterType", true);
    }
}

export {
    ScheduleVisitDuringPregnantWomanEnrolment,
    ScheduleVisitDuringEligibleCoupleEnrolment,
    ScheduleVisitsDuringANC,
    ScheduleVisitsDuringANCClusterIncharge,
    ScheduleVisitDuringDelivery,
    ScheduleVisitsDuringPNC,
    ScheduleVisitDuringAbortion,
    ScheduleVisitsDuringAbortionFollowup,
    ScheduleVisitsDuringECFollowup,
    ScheduleVisitsOnCancel,
    ScheduleVisitDuringChildEnrolment,
    ScheduleVisitsDuringChildFollowup,
    ScheduleVisitsDuringChildFollowupClusterIncharge,
    ScheduleVisitsDuringBirth,
    ScheduleVisitsDuringChildPNC,
    ScheduleVisitsDuringChildPNCClusterIncharge
}