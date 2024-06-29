INSERT INTO campuses ("id", "name", "slug") VALUES ('1618a24a-c53b-4570-a6c1-a9f752a5b721', 'Main Campus', 'main');

INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('0ed10689-b1cd-4b78-a46e-3aa934a8462f', 'College of Agriculture, Food, Environment and Natural Resources', 'cafenr', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('c42ec848-57b2-45ef-ac4c-adced7d4f7bc', 'College of Arts and Sciences', 'cas', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('e2813e73-3345-4261-bb90-8365c1e784d4', 'College of Criminal Justice', 'ccj', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('91141f84-1a19-400d-b10d-1733c1099501', 'College of Education', 'ced', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('3ebb11d4-6082-4aad-8996-013ba11d4931', 'College of Economics, Management and Development Studies', 'cemds', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('7f51bc8a-0ca1-42a4-ba68-d334316b3b63', 'College of Engineering and Information Technology', 'ceit', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('38238ea2-7a42-4164-8cfb-f9b50d075649', 'College of Nursing', 'con', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('f625924b-eb7a-434e-a0e6-13e48252ea91', 'College of Sports, Physical Education and Recreation', 'cspear', '1618a24a-c53b-4570-a6c1-a9f752a5b721');
INSERT INTO colleges ("id", "name", "slug", "campus_id") VALUES ('57c42cdc-b69d-4454-9e06-e3f9f87b051e', 'College of Veterinary Medicine and Biomedical Sciences', 'cvmbs', '1618a24a-c53b-4570-a6c1-a9f752a5b721');

INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('f5f32438-0eac-4178-9d7b-c45e828409d6', 'Bachelor of Science in Agriculture Major in Animal Science', 'bsa-as', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('b7542d20-1b93-453b-9b5f-9876aa7fd21a', 'Bachelor of Science in Agriculture Major in Crop Science', 'bsa-cs', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('1bb885dc-1783-4e83-8d40-69afaee62ee3', 'Bachelor of Science in Environmental Science', 'bses', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('a1c43284-26ef-42fe-a606-ac29beeda5d0', 'Bachelor of Science in Food Technology', 'bsft', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('57d22d48-18f7-4371-bc16-364645524dff', 'Bachelor of Science in Land Use Design and Management', 'bsludm', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('fe952417-db80-48a7-ac2e-c5827879622f', 'Bachelor in Agricultural Entrepreneurship', 'bae', '0ed10689-b1cd-4b78-a46e-3aa934a8462f');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('f7e85abd-0cbf-4f29-91cb-a0685257cb7b', 'Bachelor of Science in Biology', 'bs-bio', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('ca47cf23-a927-4ce2-a6d4-5b328e963e29', 'Bachelor of Arts in English Language Studies', 'baels', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('dcd38f5d-176b-4dbc-ad4f-745e8a94e778', 'Bachelor of Science in Psychology', 'bsp', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('75e434c3-acc3-4aa1-8e4c-8eb317045ee4', 'Bachelor of Arts in Political Science', 'baps', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('8187d6a1-e57e-4605-8fee-20ad08721599', 'Bachelor of Arts in Journalism', 'baj', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('bb303927-39ff-4f13-b8a0-b869afae8ee7', 'Bachelor of Science in Social Work', 'bssw', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('e8503d5a-9e30-489a-bc59-75f7775ddb46', 'Bachelor of Science in Applied Mathematics', 'bsam', 'c42ec848-57b2-45ef-ac4c-adced7d4f7bc');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('1c207056-4092-4459-ac80-aa23732daa67', 'Bachelor of Science in Criminology', 'bs-crim', 'e2813e73-3345-4261-bb90-8365c1e784d4');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('52a7845e-e7c9-4dfa-917b-722c37421d76', 'Bachelor of Science in Industrial Security Management', 'bsism', 'e2813e73-3345-4261-bb90-8365c1e784d4');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('3c94d7d2-ea5b-4e7e-9473-1a4484d66778', 'Bachelor of Elementary Education', 'bee', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('2b191d76-4daf-4d68-8070-1a1df800b72c', 'Bachelor of Secondary Education - Major in English', 'bse-eng', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('97b8f00d-3bd0-4d32-a732-5f6cc9c5c9a6', 'Bachelor of Secondary Education - Major in Science', 'bse-sci', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('8a778360-a72c-4629-9206-3563eb8bff84', 'Bachelor of Secondary Education - Major in Filipino', 'bse-fil', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('2ff65d16-7aad-464b-81ed-8cf41ef70ac0', 'Bachelor of Secondary Education - Major in Mathematics', 'bse-math', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('dd6cfcd7-22f1-46c1-9207-8c739dce8440', 'Bachelor of Secondary Education - Major in Social Science', 'bse-socsci', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('891264e1-2099-4ad1-8ea0-1e68c1db61f4', 'Bachelor of Science in Tourism Management', 'bstm', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('2e7a967f-618b-4eca-b515-47a3cebd3488', 'Bachelor of Early Childhood Education', 'bece', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('3796b3c6-f8d6-4011-907e-2fe8ff43ac59', 'Bachelor of Special Needs Education', 'bsne', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('2584b7ec-d5d5-44ac-ae41-a1ab4b764263', 'Bachelor of Technology and Livelihood Education', 'btle', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('8db9db15-9ff2-46bd-b82c-778872904f97', 'Bachelor of Science in Hospitality Management', 'bshm', '91141f84-1a19-400d-b10d-1733c1099501');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('85e4f7ca-e2dd-4986-bdcc-6cf8bafa9eb9', 'Bachelor of Science in Accountancy', 'bs-acc', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('8454dffc-127b-481f-bf73-c76d939114aa', 'Bachelor of Science in Business Management', 'bsbm', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('5afffa7f-24b8-4ed2-8c48-953cded3e333', 'Bachelor of Science in Economics', 'bs-econ', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('e2c5f7b7-18bb-458d-8eac-ce0d398e60a4', 'Bachelor of Science in Development  Management', 'bsdm', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('e3b2a04e-417a-4459-bfeb-7664daa11869', 'Bachelor of Science in International Studies', 'bsis', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('1b6c646a-f696-4c7b-bb88-7a4460671c1a', 'Bachelor of Science in Agricultural and Biosystems Engineering', 'bsabe', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('90179665-6128-4f43-8f2b-1a9dfc1b2e2f', 'Bachelor of Science in Architecture', 'bsarch', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('8d55d3f0-eb83-416a-b709-0b65f95ba80e', 'Bachelor of Science in Civil Engineering', 'bsce', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('d23d7c74-8126-4d96-a3f6-5af53ef5ed01', 'Bachelor of Science in Computer Engineering', 'bscomp-eng', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('67e7cc1b-e1da-4859-bf5a-e72bd27eb930', 'Bachelor of Science in Computer Science', 'bscs', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('ac9aa244-9c3b-45c2-94af-bc10c37e3861', 'Bachelor of Science in Electrical Engineering', 'bsee', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('f8a2447e-a6c0-448b-890d-d566ac8feed0', 'Bachelor of Science in Electronics Engineering', 'bsece', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('bf88fbc0-2833-41b3-b103-1347be204bcd', 'Bachelor of Science in Industrial Engineering', 'bsie', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('48b15039-139b-444c-b57f-ebd55a0a5685', 'Bachelor of Science in Industrial Technology Major in Automotive Technology', 'bsit-at', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('521f9712-918f-4ef0-9fa1-63172e22b35c', 'Bachelor of Science in Industrial Technology Major in Electrical Technology', 'bsit-et', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('43369632-525e-4e6c-8857-92cabbb688b8', 'Bachelor of Science in Industrial Technology Major in Electronics Technology', 'bsit-elex', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('f4364e1c-3f4a-4f6b-9cb3-d96cf3acd5df', 'Bachelor of Science in Information Technology', 'bsit', '7f51bc8a-0ca1-42a4-ba68-d334316b3b63');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('3b96d88e-66e4-4d39-b5c4-b994adcedec7', 'Bachelor of Science in Office Administration', 'bsoa', '3ebb11d4-6082-4aad-8996-013ba11d4931');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('418523c7-109e-4292-8010-83872c5b1ec1', 'Bachelor of Science in Nursing', 'bsn', '38238ea2-7a42-4164-8cfb-f9b50d075649');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('966f6f6f-4225-4b96-ac7b-14bd752d1345', 'Bachelor of Science in Medical Technology', 'bsmt', '38238ea2-7a42-4164-8cfb-f9b50d075649');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('5ec9df83-8731-49cb-b517-beb0e96cdc10', 'Bachelor of Science in Midwifery', 'bsm', '38238ea2-7a42-4164-8cfb-f9b50d075649');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('74e9a035-49e6-4267-a67f-06f7618a9764', 'Bachelor of Physical Education', 'bped', 'f625924b-eb7a-434e-a0e6-13e48252ea91');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('d8485787-f74b-428b-8d35-19827f6b269d', 'Bachelor of Exercise and Sports Sciences', 'bsess', 'f625924b-eb7a-434e-a0e6-13e48252ea91');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('c2915e3a-6178-4a3e-bfd5-f71ea09391e3', 'Doctor of Veterinary Medicine', 'dvm', '57c42cdc-b69d-4454-9e06-e3f9f87b051e');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('7f67c92c-a4d1-44df-b225-d929f8ab5954', 'Bachelor of Science in Veterinary Technology', 'bsvt', '57c42cdc-b69d-4454-9e06-e3f9f87b051e');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('9f3fe5ef-ab2f-454a-a393-6a7ef09ef2b3', 'Bachelor of Science in  Animal Health and Management', 'bsahm', '57c42cdc-b69d-4454-9e06-e3f9f87b051e');
INSERT INTO programs ("id", "name", "slug", "college_id") VALUES ('ed76e074-b92a-451e-8074-7b761d5d29b7', 'Bachelor of Science in Biomedical Science', 'bsbs', '57c42cdc-b69d-4454-9e06-e3f9f87b051e');

INSERT INTO "storage"."buckets" (
    "id",
    "name",
    "owner",
    "created_at",
    "updated_at",
    "public",
    "avif_autodetection",
    "file_size_limit",
    "allowed_mime_types",
    "owner_id"
  )
VALUES 
  (
    'users',
    'users',
    NULL,
    '2024-01-25 01:40:30.239876+00',
    '2024-01-25 01:40:30.239876+00',
    'f',
    'f',
    NULL,
    NULL,
    NULL
  ),(
    'posts',
    'posts',
    NULL,
    '2024-01-25 01:40:30.239876+00',
    '2024-01-25 01:40:30.239876+00',
    'f',
    'f',
    NULL,
    NULL,
    NULL
  );
