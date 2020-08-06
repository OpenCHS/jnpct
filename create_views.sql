set role jnpct_uat;

create view jnpct_delivery_view as
SELECT individual.id                                                                             AS "Ind.Id",
       individual.address_id                                                                     AS "Ind.address_id",
       individual.uuid                                                                           AS "Ind.uuid",
       individual.first_name                                                                     AS "Ind.first_name",
       individual.last_name                                                                      AS "Ind.last_name",
       g.name                                                                                    AS "Ind.Gender",
       individual.date_of_birth                                                                  AS "Ind.date_of_birth",
       individual.date_of_birth_verified                                                         AS "Ind.date_of_birth_verified",
       individual.registration_date                                                              AS "Ind.registration_date",
       individual.facility_id                                                                    AS "Ind.facility_id",
       village.title                                                                             AS "Ind.village",
       subcenter.title                                                                           AS "Ind.subcenter",
       phc.title                                                                                 AS "Ind.phc",
       block.title                                                                               AS "Ind.block",
       individual.is_voided                                                                      AS "Ind.is_voided",
       op.name                                                                                   AS "Enl.Program Name",
       programenrolment.id                                                                       AS "Enl.Id",
       programenrolment.uuid                                                                     AS "Enl.uuid",
       programenrolment.is_voided                                                                AS "Enl.is_voided",
       oet.name                                                                                  AS "Enc.Type",
       programencounter.id                                                                       AS "Enc.Id",
       programencounter.earliest_visit_date_time                                                 AS "Enc.earliest_visit_date_time",
       programencounter.encounter_date_time                                                      AS "Enc.encounter_date_time",
       programencounter.program_enrolment_id                                                     AS "Enc.program_enrolment_id",
       programencounter.uuid                                                                     AS "Enc.uuid",
       programencounter.name                                                                     AS "Enc.name",
       programencounter.max_visit_date_time                                                      AS "Enc.max_visit_date_time",
       programencounter.is_voided                                                                AS "Enc.is_voided",
       (single_select_coded((individual.observations ->>
                             'a20a030b-9bef-4ef8-ba8a-88e2b23c1478'::text)))::text               AS "Ind.Marital status",
       (individual.observations ->>
        'a01c2055-7483-4a19-98c1-80fdf955b50c'::text)                                            AS "Ind.Number of family members",
       (single_select_coded((individual.observations ->>
                             'f4028968-bbac-4a66-8fe7-df081321414f'::text)))::text               AS "Ind.Who is decision making person in family",
       (single_select_coded((individual.observations ->>
                             '8eb5a6ce-7b8a-45cc-a066-fcceca3708f7'::text)))::text               AS "Ind.Ration card",
       (single_select_coded((individual.observations ->>
                             'ba25ac4c-784a-4723-8e15-a965a0d63b50'::text)))::text               AS "Ind.Caste",
       (single_select_coded((individual.observations ->>
                             '5f20070c-1cfe-4e0b-b0db-70dffee99394'::text)))::text               AS "Ind.Subcaste",
       (single_select_coded((individual.observations ->>
                             'b9c9d807-7064-46fd-8dc7-1640345dc8cb'::text)))::text               AS "Ind.Religion",
       (single_select_coded((individual.observations ->>
                             '4e90fc18-7bf1-4722-87c3-f3b2bd5d1d7d'::text)))::text               AS "Ind.Satipati family",
       (single_select_coded((individual.observations ->>
                             '0a668e5b-f3c2-4fc6-8589-d2abda26658b'::text)))::text               AS "Ind.Addiction",
       (multi_select_coded(
               (individual.observations -> 'e0a3086c-8d69-479e-bf44-258bc27b8105'::text)))::text AS "Ind.Addiction - Please specify",
       (single_select_coded((individual.observations ->>
                             '89fe78b2-20a9-45f1-90e3-119a7bc95ce3'::text)))::text               AS "Ind.Very poor family",
       (single_select_coded((individual.observations ->>
                             '6f03e969-f0bf-4438-a528-5d2ce3b70e15'::text)))::text               AS "Ind.Occupation of mother",
       (single_select_coded((individual.observations ->>
                             '65a5101b-38fc-4962-876e-e0f8b9ba4cec'::text)))::text               AS "Ind.Occupation of husband/father",
       (single_select_coded((individual.observations ->>
                             'e42f5b28-bee4-4a01-aff0-922d823d0075'::text)))::text               AS "Ind.Mother's education",
       (individual.observations ->>
        '881d9628-eb4f-4056-ae10-09e4ef71cae4'::text)                                            AS "Ind.Mobile number",
       (single_select_coded((individual.observations ->>
                             '5f0b2fa0-ed20-4d6b-a8b5-3fed09dac067'::text)))::text               AS "Ind.Specialy abled",
       (single_select_coded((individual.observations ->>
                             'a154508a-9d8b-49d9-9d78-b61cbc9daf7f'::text)))::text               AS "Ind.Specially abled - Please specify",
       (single_select_coded((individual.observations ->>
                             'd009887c-6d29-4c47-9e34-21e3b9298f44'::text)))::text               AS "Ind.Any long-term illnesses",
       (multi_select_coded(
               (individual.observations -> '7fa81959-a016-4569-920d-47dee242b27a'::text)))::text AS "Ind.Long-term illness - Please specify",
       (single_select_coded((individual.observations ->>
                             '54105452-1752-4661-9d30-2d99bd2d04fa'::text)))::text               AS "Ind.Toilet facility present",
       (single_select_coded((individual.observations ->>
                             '59db93f0-0963-4e49-87b6-485efb705561'::text)))::text               AS "Ind.Using the toilet regularly",
       (multi_select_coded(
               (individual.observations -> '789733c4-42ba-4da3-89e6-71da227cf4c2'::text)))::text AS "Ind.Source of drinking water",
       (individual.observations ->>
        '7170eabd-6f4f-4e30-b22e-85b20a4d854f'::text)                                            AS "Ind.Aadhaar card",
       ((programenrolment.observations ->>
         '0cf252ba-e6b4-4209-903b-4b6d48cd7070'::text))::date                                    AS "Enl.Last menstrual period",
       ((programenrolment.observations ->>
         '83e23cc8-52c2-4c8d-8f34-adb98f0db604'::text))::date                                    AS "Enl.Estimated Date of Delivery",
       (multi_select_coded((programenrolment.observations ->
                            '8bee6542-cd1e-4bd8-b0d4-5a88575fcb1c'::text)))::text                AS "Enl.Previous history of disease",
       (programenrolment.observations ->>
        'b5e0662c-7412-4fd1-9a6b-4f0f8c62afc1'::text)                                            AS "Enl.Other previous history of disease - Please specify",
       (single_select_coded((programenrolment.observations ->>
                             'bec0e4d4-8daf-4956-8906-0f579b4cf628'::text)))::text               AS "Enl.Gravida",
       (programenrolment.observations ->>
        '3bf33915-bc67-4431-86eb-a38905be62cf'::text)                                            AS "Enl.Number of Abortion",
       (programenrolment.observations ->>
        '9acef9b8-8212-49c0-b421-824f9314f319'::text)                                            AS "Enl.Number of live childrens",
       (programenrolment.observations ->>
        '76333e77-9ff5-4caf-9a87-021e915f0e9f'::text)                                            AS "Enl.MALE",
       (programenrolment.observations ->>
        '2a523870-c948-4418-8283-902c3494b607'::text)                                            AS "Enl.FEMALE",
       (single_select_coded((programenrolment.observations ->>
                             '4c8e7665-30f1-4f65-b76e-b9132904ed69'::text)))::text               AS "Enl.Result of last delivery",
       ((programenrolment.observations ->>
         '4e89f7b0-0b3d-4902-8f78-6d45ac5614a9'::text))::date                                    AS "Enl.Age of Youngest child",
       (single_select_coded((programenrolment.observations ->>
                             '8e28efd9-7bc8-4870-929d-867ad9367962'::text)))::text               AS "Enl.Place of last delivery",
       (single_select_coded((programenrolment.observations ->>
                             '9b7af000-0354-4036-a7ab-1f07b43346df'::text)))::text               AS "Enl.Risk in the last pregnancy",
       (multi_select_coded((programenrolment.observations ->
                            '9f8e78d6-72fc-4f03-9dd9-3ec7f28639df'::text)))::text                AS "Enl.what kind of risk occurred",
       ((programencounter.observations ->>
         'd1effb17-12e7-42b4-8791-8a7c4a7c1a64'::text))::date                                    AS "Enc.Date of delivery",
       (single_select_coded((programencounter.observations ->>
                             '95ee3ade-e926-4f8e-a6b9-6c4086a4db3a'::text)))::text               AS "Enc.Place of delivery",
       (single_select_coded((programencounter.observations ->>
                             'ab201e49-cf1c-44c0-8a86-0545a2d57227'::text)))::text               AS "Enc.Delivery pack used ?",
       ((programencounter.observations ->>
         '94f0dddd-0b11-45d7-8aae-7ba9f08b3bb4'::text))::date                                    AS "Enc.Date of discharge",
       (programencounter.observations ->>
        'a2c7a7b3-ef6d-42d1-8d4b-b8b140625c4c'::text)                                            AS "Enc.Number of days stayed at the hospital",
       (programencounter.observations ->>
        'f38349e4-afad-4bed-897b-dfb32d8c4c08'::text)                                            AS "Enc.Week of Gestation",
       (single_select_coded((programencounter.observations ->>
                             'c07b4a59-8155-4015-a220-a20c80da9f75'::text)))::text               AS "Enc.Delivered By",
       (single_select_coded((programencounter.observations ->>
                             '3a896aa4-db6c-42b1-abab-9fb89bd62c79'::text)))::text               AS "Enc.Type of delivery",
       (single_select_coded((programencounter.observations ->>
                             'eb1dd4c0-0465-4865-a357-7325184b29ad'::text)))::text               AS "Enc.Delivery outcome",
       (multi_select_coded((programencounter.observations ->
                            'd63cf4d8-e890-4b0f-b331-25aa87f61cc3'::text)))::text                AS "Enc.Delivery complication",
       (programencounter.observations ->>
        'facf00bd-b1db-4304-b0e4-e484d7e3db29'::text)                                            AS "Enc.Number of babies",
       (single_select_coded((programencounter.observations ->>
                             'd3de7fbb-9851-41b8-9b6a-4c183f4986ea'::text)))::text               AS "Enc.Gender of Newborn1",
       (programencounter.observations ->>
        'f0a5edd9-5250-4f27-bc0d-0536b13c8a25'::text)                                            AS "Enc.Weight of Newborn1",
       (single_select_coded((programencounter.observations ->>
                             '3f0c5c4e-40bd-476d-a0ae-3a7e19c78c83'::text)))::text               AS "Enc.Gender of Newborn2",
       (programencounter.observations ->>
        'b24b1d7d-5c08-495e-a8fc-e0c2c854d694'::text)                                            AS "Enc.Weight of Newborn2",
       (single_select_coded((programencounter.observations ->>
                             '8dda0b63-3d60-4a09-888b-e40683c32776'::text)))::text               AS "Enc.Gender of Newborn3",
       (programencounter.observations ->>
        'fe7784c0-61ef-481a-98be-7ebeff7cfdde'::text)                                            AS "Enc.Weight of Newborn3",
       (programencounter.observations ->>
        'a738b2ba-84a9-4e4f-9e0c-0f2bbafc44b0'::text)                                            AS "Enc.Number of Stillborn babies",
       (single_select_coded((programencounter.observations ->>
                             'f35f29b3-5c6e-4b8e-a2d9-3847a7f4af3d'::text)))::text               AS "Enc.Gender of Stillborn1",
       (programencounter.observations ->>
        '69114ef1-3fd1-4a57-b58d-c6e7169fd65c'::text)                                            AS "Enc.Weight of Stillborn1",
       (single_select_coded((programencounter.observations ->>
                             'ac7d6e60-93c2-4227-b9fa-87ede2c8af96'::text)))::text               AS "Enc.Gender of Stillborn2",
       (programencounter.observations ->>
        'bed2de93-e2ea-4677-8301-2e6b1173b248'::text)                                            AS "Enc.Weight of Stillborn2",
       (single_select_coded((programencounter.observations ->>
                             'e28df31b-1434-4dc5-8a65-baa6eb8e30cc'::text)))::text               AS "Enc.Gender of Stillborn3",
       (programencounter.observations ->>
        '46601220-c8f7-4e1a-bab2-8176ca92f130'::text)                                            AS "Enc.Weight of Stillborn3",
       (single_select_coded((programencounter.observations ->>
                             '96147a70-1bd0-4210-8260-56c956bf05da'::text)))::text               AS "Enc.Mother with high risk",
       (single_select_coded((programencounter.observations ->>
                             '55075e60-068a-46e9-8d12-663a3d9784df'::text)))::text               AS "Enc.Did beneficiary inform to Aarogya Saheli?",
       (single_select_coded((programencounter.observations ->>
                             'df02e753-a400-436b-870b-97482d131e06'::text)))::text               AS "Enc.Aarogya Saheli present durinng the time of delivery?",
       programencounter.cancel_date_time                                                         AS "EncCancel.cancel_date_time"
FROM program_encounter programencounter
         LEFT JOIN operational_encounter_type oet ON programencounter.encounter_type_id = oet.encounter_type_id
         LEFT JOIN program_enrolment programenrolment ON programencounter.program_enrolment_id = programenrolment.id
         LEFT JOIN operational_program op ON op.program_id = programenrolment.program_id
         LEFT JOIN individual individual ON programenrolment.individual_id = individual.id
         LEFT JOIN gender g ON g.id = individual.gender_id
         LEFT JOIN address_level village ON individual.address_id = village.id
         LEFT JOIN address_level subcenter ON village.parent_id = subcenter.id
         LEFT JOIN address_level phc ON subcenter.parent_id = phc.id
         LEFT JOIN address_level block ON phc.parent_id = block.id
WHERE op.uuid::text = '0d9321b2-4bb8-437d-b191-cc39ee00e75a'::text
  AND oet.uuid::text = '333b12a7-d21e-4f19-89ac-a82484bae8e7'::text
  AND programencounter.encounter_date_time IS NOT NULL
  AND programenrolment.enrolment_date_time IS NOT NULL;

