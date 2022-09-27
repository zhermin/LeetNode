const {Prisma} = require('@prisma/client')

const topics = [
    {
      topicID: "2958a60e-4f12-4351-97e0-5774d4c5ce20",
      topicName: 'Power = V x I',
      topicLevel: 1,
    },
    {
      topicID: "39fc0efc-1332-4d6a-b9e3-0d62480cd7c0",
      topicName: "Ohm's Law",
      topicLevel: 1,
    },
    {
      topicID: "3df16699-279b-4ebd-a477-73b1ee28cefe",
      topicName: 'KVL',
      topicLevel: 1,
    },
    {
      topicID: "470cf67f-13fe-4ba2-96d4-b00e0c13ccfb",
      topicName: 'KCL',
      topicLevel: 1,
    },
    {
      topicID: "5380acfd-118d-47cd-a6eb-7ea78090a86c",
      topicName: 'Thevenin Equivalent Circuit',
      topicLevel: 1,
    },
    {
      topicID: "550c5129-c7c3-4552-8d16-0e33cd098929",
      topicName: 'Equivalent Resistance when connected in Series or Parallel',
      topicLevel: 1,
    },
    {
      topicID: "58a0f3ed-6108-485e-ba84-c8f7a1785c09",
      topicName: 'Voltage Division Principle',
      topicLevel: 1,
    },
    {
      topicID: "621b0a1f-8cbe-47de-b74b-6e91f1400e0c",
      topicName: 'Current Division Principle',
      topicLevel: 1,
    },
    {
      topicID: "66a44893-6676-4697-9da5-39b79ee8683e",
      topicName: 'Node Voltage Analysis Technique',
      topicLevel: 2,
    },
    {
      topicID: "6ef0082c-8ec8-4c98-9c1a-1a6f10506216",
      topicName: 'Steady State Analysis of RLC Circuits',
      topicLevel: 2,
    },
    {
      topicID: "78e3e654-c5af-4f35-87f0-32654b8b9155",
      topicName: 'Transient Analysis of Series RC Circuits and Series RL Circuits',
      topicLevel: 2,
    },
    {
      topicID: "8585768e-465c-4534-9715-df88d016eed9",
      topicName: 'Equivalent Capacitance When Connected in Series or Parallel',
      topicLevel: 2,
    },
    {
      topicID: "924694ac-73cd-420e-83a2-f50871d7d299",
      topicName: 'Equivalent Inductance When Connected in Series or Parallel',
      topicLevel: 2,
    },
    {
      topicID: "9317dfe1-b323-4c80-9712-116fdb2b56d1",
      topicName: 'Energy Stored in Capacitors, Inductors',
      topicLevel: 2,
    },
    {
      topicID: "bd6d070a-af7a-4e4b-9b02-e8e78916b3de",
      topicName: 'Electrical Circuit Model of PMDC Motors',
      topicLevel: 2,
    },
    {
      topicID: "be12fd90-9d07-4e0c-901a-802a2f5c3834",
      topicName: 'Torque Equation',
      topicLevel: 3,
    },
    {
      topicID: "cd05a6ed-8420-4682-81b4-73e1ffd9111c",
      topicName: 'Calculation of Mechanical Power & Electrical Power of DC Motors',
      topicLevel: 3,
    },
    {
      topicID: "cd6c6c21-cc56-462b-8270-6289824aa359",
      topicName: 'Gains of Inverting and Non-Inverting Amplifiers',
      topicLevel: 3,
    },
    {
      topicID: "e2330607-2972-4334-ad3d-19d746a82a59",
      topicName: 'Op-Amp Golden Rules',
      topicLevel: 3,
    },
    {
      topicID: "e35c871e-6e76-4b90-9c39-c1d48299dbbd",
      topicName: 'Analysis of Circuits Containing Op-Amps',
      topicLevel: 3,
    },
    {
      topicID: "e5c95646-bd9c-42f3-98bc-d75a1e477d53",
      topicName: 'First Order Low Pass Filters',
      topicLevel: 3,
    },
    {
      topicID: "e94aad77-2e97-4853-b0cb-69ee884e7ccd",
      topicName: 'First Order High Pass Filters',
      topicLevel: 3,
    },
  ];
  
  const questions = [
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      topicID: "2958a60e-4f12-4351-97e0-5774d4c5ce20",
      questionContent: 'For the circuit shown in the figure above, what is the value of current I1?',
      questionDifficulty: 1,
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      topicID: "58a0f3ed-6108-485e-ba84-c8f7a1785c09",
      questionContent: 'For the circuit shown in the figure above, what is the voltage V1?',
      questionDifficulty: 2,
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      topicID: "8585768e-465c-4534-9715-df88d016eed9",
      questionContent: 'A current of 3 A flows through a resistor network as shown in the figure above. The voltage difference VXY (given by VX – VY) is',
      questionDifficulty: 2,
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      topicID: "5380acfd-118d-47cd-a6eb-7ea78090a86c",
      questionContent: 'What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)',
      questionDifficulty: 2,
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      topicID: "58a0f3ed-6108-485e-ba84-c8f7a1785c09",
      questionContent: 'What is the maximum power that can be utilized by the variable load R?',
      questionDifficulty: 2,
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      topicID: "5380acfd-118d-47cd-a6eb-7ea78090a86c",
      questionContent: 'For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?',
      questionDifficulty: 2,
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      topicID: "66a44893-6676-4697-9da5-39b79ee8683e",
      questionContent: 'For the circuit shown in the figure above, what is the node voltage VA?',
      questionDifficulty: 2,
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      topicID: "58a0f3ed-6108-485e-ba84-c8f7a1785c09",
      questionContent: "For the circuit shown in the figure above, is Battery B being recharged or discharged? What is the power lost in Battery B's internal resistance?",
      questionDifficulty: 2,
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      topicID: "78e3e654-c5af-4f35-87f0-32654b8b9155",
      questionContent: 'In the circuit shown in the figure above, the two switches were opened for a very long time before time t = 0. At time t = 0, both the switches are closed simultaneously. How long does it take for the voltage VL(t) to fall to 7 V after the switches are closed?',
      questionDifficulty: 3,
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      topicID: "78e3e654-c5af-4f35-87f0-32654b8b9155",
      questionContent: "In the circuit shown in the figure above, the capacitor was fully discharged initially. At time t = 0, the switch is closed. If it takes 6 s for the practical capacitor's voltage VPC(t) to rise to 6 V, what is the value of capacitance C?",
      questionDifficulty: 3,
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      topicID: "6ef0082c-8ec8-4c98-9c1a-1a6f10506216",
      questionContent: "In the circuit shown in the figure above, the capacitor's voltage vC(t) is",
      questionDifficulty: 2,
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      topicID: "6ef0082c-8ec8-4c98-9c1a-1a6f10506216",
      questionContent: 'In the circuit shown in the figure above, a 100-ohm resistor is connected in series with a practical inductor. The practical inductor has a resistance of 10-ohm, and an unknown inductance L. Suppose the phase angle of the voltage vR(t) is found to be –35° with respect to the source voltage vS(t), what is the voltage across the practical inductor vPL(t)?',
      questionDifficulty: 3,
    },
  ];

  const answers = [
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      optionNumber: 1,
      answerContent: "0.2A",
      isCorrect: true,
    },
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      optionNumber: 2,
      answerContent: "1A",
      isCorrect: false,
    },
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      optionNumber: 3,
      answerContent: "0.6A",
      isCorrect: false,
    },
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      optionNumber: 4,
      answerContent: "0.8A",
      isCorrect: false,
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      optionNumber: 1,
      answerContent: "2mV",
      isCorrect: true,
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      optionNumber: 2,
      answerContent: "2.5V",
      isCorrect: false,
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      optionNumber: 3,
      answerContent: "10V",
      isCorrect: false,
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      optionNumber: 4,
      answerContent: "0.2V",
      isCorrect: false,
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      optionNumber: 1,
      answerContent: "0.67V",
      isCorrect: true,
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      optionNumber: 2,
      answerContent: "1V",
      isCorrect: false,
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      optionNumber: 3,
      answerContent: "-0.67V",
      isCorrect: false,
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      optionNumber: 4,
      answerContent: "-1V",
      isCorrect: false,
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      optionNumber: 1,
      answerContent: "\(4~\Omega\)",
      isCorrect: true,
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      optionNumber: 2,
      answerContent: "\(11~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      optionNumber: 3,
      answerContent: "\(10.2~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      optionNumber: 4,
      answerContent: "\(20.8~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      optionNumber: 1,
      answerContent: "113mW",
      isCorrect: true,
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      optionNumber: 2,
      answerContent: "173mW",
      isCorrect: false,
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      optionNumber: 3,
      answerContent: "163mW",
      isCorrect: false,
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      optionNumber: 4,
      answerContent: "703mW",
      isCorrect: false,
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      optionNumber: 1,
      answerContent: "\(V_T = 7~V,~~~~~R_T = 1.2~\Omega\)",
      isCorrect: true,
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      optionNumber: 2,
      answerContent: "\(V_T = 7~V,~~~~~R_T = 1.33~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      optionNumber: 3,
      answerContent: "\(V_T = 7.4~V,~~~~~R_T = 1.2~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      optionNumber: 4,
      answerContent: "\(V_T = 7.4~V,~~~~~R_T = 1.33~\Omega\)",
      isCorrect: false,
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      optionNumber: 1,
      answerContent: "3.83V",
      isCorrect: true,
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      optionNumber: 2,
      answerContent: "4V",
      isCorrect: false,
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      optionNumber: 3,
      answerContent: "4.13V",
      isCorrect: false,
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      optionNumber: 4,
      answerContent: "4.24V",
      isCorrect: false,
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      optionNumber: 1,
      answerContent: "Battery B is being recharged;  Power lost in Battery B's internal resistance is 0.365mW.",
      isCorrect: true,
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      optionNumber: 2,
      answerContent: "Battery B is being recharged;  Power lost in Battery B's internal resistance is 36.5mW.",
      isCorrect: false,
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      optionNumber: 3,
      answerContent: "Battery B is being discharged;  Power lost in Battery B's internal resistance is 0.365mW.",
      isCorrect: false,
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      optionNumber: 4,
      answerContent: "Battery B is being discharged;  Power lost in Battery B's internal resistance is 36.5mW.",
      isCorrect: false,
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      optionNumber: 1,
      answerContent: "83.8ms",
      isCorrect: true,
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      optionNumber: 2,
      answerContent: "377ms",
      isCorrect: false,
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      optionNumber: 3,
      answerContent: "18.6ms",
      isCorrect: false,
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      optionNumber: 4,
      answerContent: "44.5ms",
      isCorrect: false,
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      optionNumber: 1,
      answerContent: "0.74F",
      isCorrect: true,
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      optionNumber: 2,
      answerContent: "0.863F",
      isCorrect: false,
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      optionNumber: 3,
      answerContent: "0.987F",
      isCorrect: false,
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      optionNumber: 4,
      answerContent: "1.11F",
      isCorrect: false,
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      optionNumber: 1,
      answerContent: "56.9 cos (100t - 129.3°)",
      isCorrect: true,
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      optionNumber: 2,
      answerContent: "80.4 cos (100t - 84.3°)",
      isCorrect: false,
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      optionNumber: 3,
      answerContent: "1.13 cos (100t + 129.3°)",
      isCorrect: false,
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      optionNumber: 4,
      answerContent: "56.9 cos (100t - 39.3°)",
      isCorrect: false,
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      optionNumber: 1,
      answerContent: "2.89 cos (100t + 47.6°)",
      isCorrect: true,
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      optionNumber: 2,
      answerContent: "3.34 cos (100t + 55°)",
      isCorrect: false,
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      optionNumber: 3,
      answerContent: "3.55 cos (100t + 39.8°)",
      isCorrect: false,
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      optionNumber: 4,
      answerContent: "4.1 cos (100t + 31.4°)",
      isCorrect: false,
    },
  ];

  const questionMedia =[
    {
      questionID: "015aef16-1432-44c3-bfbc-681ea3862da1",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q01-1_bzugpn.png",
    },
    {
      questionID: "1cdfaa21-367d-4a18-9036-fef2307fae51",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q02-1_ujltou.png",
    },
    {
      questionID: "54194bc8-fb33-4f7a-951e-2c5ce321188f",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q03-1_ah6aen.png",
    },
    {
      questionID: "88876e69-dea0-492c-89b9-b14f4ea7066f",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q04_gxwt6z.png",
    },
    {
      questionID: "8d316106-23f4-448c-8d4c-fd102bb4235d",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q05-1_dbyrie.png",
    },
    {
      questionID: "9c506a33-4cd0-461f-9cbf-daf56d9c9bd0",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q06-1_inu8j6.png",
    },
    {
      questionID: "c9ab193f-ca3a-491e-a443-3aad9cb67f85",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q07-1_l9qdr1.png",
    },
    {
      questionID: "ceb5ff80-3e2c-4962-ac7d-a2f95efce03a",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q08-1_aq5z1i.png",
    },
    {
      questionID: "db5bf94f-7b7b-4729-b213-06a4f469cbb6",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q09_bxprfz.png",
    },
    {
      questionID: "e3e9630f-efeb-4dcc-9259-0d7478fb5103",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q10_uvao4q.png",
    },
    {
      questionID: "f890c3db-c662-494e-be61-d287477e7260",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q11-1_yh1hrm.png",
    },
    {
      questionID: "fa36f220-8db1-44c5-8b55-8a6f8a0b5914",
      questionMediaURL: "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q12_qiopxh.png",
    },
  ];
  
  module.exports = {
    topics,
    questions,
    answers,
    questionMedia
  };