import { Level, CourseType, QuestionDifficulty } from "@prisma/client";
import { Topic, Question, Answer, QuestionMedia } from "@prisma/client";

export const Topics: Topic[] = [
  {
    topicSlug: "power",
    topicName: "Power = V x I",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "ohms-law",
    topicName: "Ohm's Law",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "kvl",
    topicName: "Kirchhoff's Voltage Law",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "kcl",
    topicName: "Kirchhoff's Circuit Law",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "equivalent-resistance-in-series-or-parallel",
    topicName: "Equivalent Resistance when Connected in Series or Parallel",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "voltage-division-principle",
    topicName: "Voltage Division Principle",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "current-division-principle",
    topicName: "Current Division Principle",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "thevenin-equivalent-circuit",
    topicName: "Thevenin Equivalent Circuit",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "node-voltage-analysis-technique",
    topicName: "Node Voltage Analysis Technique",
    topicLevel: Level.Foundational,
  },
  {
    topicSlug: "rc-steady-state-analysis",
    topicName: "Steady State Analysis of RC Circuits",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "equivalent-capacitance",
    topicName: "Equivalent Capacitance When Connected in Series or Parallel",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "energy-stored-in-capacitors",
    topicName: "Energy Stored in Capacitors",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "rc-transient-analysis",
    topicName: "Transient Analysis of Series RC Circuits",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "rl-steady-state-analysis",
    topicName: "Steady State Analysis of RL Circuits",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "equivalent-inductance",
    topicName: "Equivalent Inductance When Connected in Series or Parallel",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "energy-stored-in-inductors",
    topicName: "Energy Stored in Inductors",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "rl-transient-analysis",
    topicName: "Transient Analysis of Series RL Circuits",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "rlc-circuit-analysis",
    topicName: "Analysis of RLC Circuits",
    topicLevel: Level.Intermediate,
  },
  {
    topicSlug: "inverting-non-inverting-amplifiers-gains",
    topicName: "Gains of Inverting and Non-Inverting Amplifiers",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "opamp-circuit-analysis",
    topicName: "Analysis of Circuits Containing Op-Amps",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "opamp-golden-rules",
    topicName: "Op-Amp Golden Rules",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "first-order-low-pass-filters",
    topicName: "First Order Low Pass Filters",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "first-order-high-pass-filters",
    topicName: "First Order High Pass Filters",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "pmdc-motors-circuit-model",
    topicName: "Electrical Circuit Model of PMDC Motors",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "dc-motors-power-calculation",
    topicName:
      "Calculation of Mechanical Power & Electrical Power of DC Motors",
    topicLevel: Level.Advanced,
  },
  {
    topicSlug: "torque-equation",
    topicName: "Torque Equation",
    topicLevel: Level.Advanced,
  },
];

type CourseWithTopics = {
  moduleCode: string;
  moduleTitle: string;
  courseSlug: string;
  courseName: string;
  courseDescription: string;
  courseImage: string;
  courseLevel: Level;
  type: CourseType;
  slide?: string;
  video?: string;
  week?: number;
  studio?: number;
  topics: Topic["topicSlug"][];
}[];

export const Courses: CourseWithTopics = [
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    courseSlug: "welcome-quiz",
    courseName: "Welcome Quiz",
    courseDescription:
      "Welcome to CG1111A! Take this quiz to help us get to know you better and recommend suitable questions.",
    courseImage:
      "https://images.unsplash.com/photo-1547521420-4328f6f9b272?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjYyNjE&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Foundational,
    type: CourseType.Quiz,
    topics: [
      "power",
      "ohms-law",
      "kvl",
      "kcl",
      "equivalent-resistance-in-series-or-parallel",
      "voltage-division-principle",
      "current-division-principle",
      "thevenin-equivalent-circuit",
    ],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 1,
    studio: 1,
    courseSlug: "fundamentals-of-electricity",
    courseName: "Fundamentals of Electricity",
    courseDescription:
      "Learn the fundamentals of electricity such as electric charge and current, power, voltage and resistance.",
    courseImage:
      "https://images.unsplash.com/photo-1510761047613-a5c1d008d780?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjY0Mjk&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Foundational,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007594/LeetNode/slides/w1s1-fundamentals-of-electricity.pdf",
    video: "agscc9MAIok",
    topics: ["power", "ohms-law"],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 1,
    studio: 2,
    courseSlug: "electrical-circuit-principles",
    courseName: "Electrical Circuit Principles",
    courseDescription:
      "Learn the principles of electrical circuits such as Kirchhoff's Laws, equivalent resistances and voltage and current division principles.",
    courseImage:
      "https://images.unsplash.com/photo-1619345371662-fccc15cc4814?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjY3MTY&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Foundational,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w1s2-electrical-circuit-principles.pdf",
    video: "knkSt14499I",
    topics: [
      "kcl",
      "kvl",
      "equivalent-resistance-in-series-or-parallel",
      "voltage-division-principle",
      "current-division-principle",
    ],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 2,
    studio: 1,
    courseSlug: "thevenin-equivalent-circuit",
    courseName: "Thevenin Equivalent Circuit",
    courseDescription:
      "Learn how to find the Thevenin equivalent circuit to simplify the analysis of electrical circuits.",
    courseImage:
      "https://images.unsplash.com/photo-1632571401005-458e9d244591?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjY4Nzk&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Foundational,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w2s1-thevenin-equivalent-circuit.pdf",
    video: "hmIDKROT9Eg",
    topics: ["thevenin-equivalent-circuit"],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 2,
    studio: 2,
    courseSlug: "circuit-analysis-techniques",
    courseName: "Circuit Analysis Techniques",
    courseDescription:
      "Learn the techniques of circuit analysis such as superposition, node and mesh analysis.",
    courseImage:
      "https://images.unsplash.com/photo-1586256053828-a36b572ab01d?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjcwNjc&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Foundational,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w2s2-circuit-analysis-techniques.pdf",
    video: "bHx3FSQM9fg",
    topics: ["node-voltage-analysis-technique"],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 3,
    studio: 1,
    courseSlug: "principles-of-capacitors",
    courseName: "Principles of Capacitors",
    courseDescription:
      "Learn the principles of capacitors such as capacitance, charging and discharging of capacitors.",
    courseImage:
      "https://images.unsplash.com/photo-1598048145816-4d54a3af68fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2NzM5MDM&ixlib=rb-4.0.3&q=80&w=400",
    courseLevel: Level.Intermediate,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w3s1-principles-of-capacitors.pdf",
    video: "BsklaRrgQWM",
    topics: [
      "rc-steady-state-analysis",
      "equivalent-capacitance",
      "energy-stored-in-capacitors",
    ],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 3,
    studio: 2,
    courseSlug: "dc-transient-behaviour-of-capacitors",
    courseName: "DC Transient Behaviour of Capacitors",
    courseDescription:
      "Learn the DC transient behaviour of capacitors such as charging and discharging of capacitors.",
    courseImage:
      "https://images.unsplash.com/photo-1625480860249-be231806e6ed?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjcyMzE&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Intermediate,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w3s2-dc-transient-behaviour-of-capacitors.pdf",
    video: "AR5bnNADoF8",
    topics: ["rc-transient-analysis"],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 4,
    studio: 1,
    courseSlug: "principles-of-inductors",
    courseName: "Principles of Inductors",
    courseDescription:
      "Learn the principles of inductors such as inductance, energy stored in inductors and steady and transient analysis of RL circuits.",
    courseImage:
      "https://images.unsplash.com/photo-1583199873815-b58ce30591ea?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjcxNTA&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Intermediate,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w4s1-principles-of-inductors.pdf",
    video: "dd3gaBiJvXc",
    topics: [
      "rl-steady-state-analysis",
      "equivalent-inductance",
      "energy-stored-in-inductors",
      "rl-transient-analysis",
    ],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 7,
    studio: 1,
    courseSlug: "basics-of-operational-amplifiers",
    courseName: "Basics of Operational Amplifiers",
    courseDescription:
      "Learn the basics of operational amplifiers (opamps) such as ideal and non-ideal opamps, opamp circuit analysis and the opamp golden rules.",
    courseImage:
      "https://images.unsplash.com/photo-1611759386165-ed9beec7b14f?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2MjczMzE&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Advanced,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007593/LeetNode/slides/w7s1-basics-of-operational-amplifiers.pdf",
    video: "YZXoTvKaNfU",
    topics: [
      "inverting-non-inverting-amplifiers-gains",
      "opamp-circuit-analysis",
      "opamp-golden-rules",
    ],
  },
  {
    moduleCode: "CG1111A",
    moduleTitle: "Engineering Principles & Practices I",
    week: 8,
    studio: 1,
    courseSlug: "opamp-comparators-and-filters",
    courseName: "Op-Amp Comparators & Filters",
    courseDescription:
      "Learn the applications of operational amplifiers (opamps) such as comparators and filters.",
    courseImage:
      "https://images.unsplash.com/photo-1510746001195-0db09655b6db?ixid=MnwzNzQ4MTR8MHwxfGFsbHx8fHx8fHx8fDE2NjY2Mjc0NDU&ixlib=rb-4.0.3&q=80w=400",
    courseLevel: Level.Advanced,
    type: CourseType.Content,
    slide:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1666007594/LeetNode/slides/w8s1-opamp-comparators-and-filters.pdf",
    video: "tkH9dECGeT0",
    topics: ["first-order-low-pass-filters", "first-order-high-pass-filters"],
  },
];

export const Questions: Question[] = [
  {
    questionId: 1,
    variationId: 1,
    topicSlug: "ohms-law",
    questionContent:
      "For the circuit shown in the figure above, what is the value of current I1?",
    questionDifficulty: QuestionDifficulty.Easy,
  },
  {
    questionId: 2,
    variationId: 1,
    topicSlug: "voltage-division-principle",
    questionContent:
      "For the circuit shown in the figure above, what is the voltage V1?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 3,
    variationId: 1,
    topicSlug: "equivalent-resistance-in-series-or-parallel",
    questionContent:
      "A current of 3 A flows through a resistor network as shown in the figure above. The voltage difference \\(V_{XY}\\) (given by \\(V_X\\) - \\(V_Y\\)) is",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 4,
    variationId: 1,
    topicSlug: "thevenin-equivalent-circuit",
    questionContent:
      "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 5,
    variationId: 1,
    topicSlug: "voltage-division-principle",
    questionContent:
      "What is the maximum power that can be utilized by the variable load R?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 6,
    variationId: 1,
    topicSlug: "thevenin-equivalent-circuit",
    questionContent:
      "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 7,
    variationId: 1,
    topicSlug: "node-voltage-analysis-technique",
    questionContent:
      "For the circuit shown in the figure above, what is the node voltage VA?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 8,
    variationId: 1,
    topicSlug: "voltage-division-principle",
    questionContent:
      "For the circuit shown in the figure above, is Battery B being recharged or discharged? What is the power lost in Battery B's internal resistance?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 9,
    variationId: 1,
    topicSlug: "rl-transient-analysis",
    questionContent:
      "In the circuit shown in the figure above, the two switches were opened for a very long time before time t = 0. At time t = 0, both the switches are closed simultaneously. How long does it take for the voltage VL(t) to fall to 7 V after the switches are closed?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
  {
    questionId: 10,
    variationId: 1,
    topicSlug: "rc-transient-analysis",
    questionContent:
      "In the circuit shown in the figure above, the capacitor was fully discharged initially. At time t = 0, the switch is closed. If it takes 6 s for the practical capacitor's voltage VPC(t) to rise to 6 V, what is the value of capacitance C?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
  {
    questionId: 11,
    variationId: 1,
    topicSlug: "rlc-circuit-analysis",
    questionContent:
      "In the circuit shown in the figure above, the capacitor's voltage vC(t) is",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 12,
    variationId: 1,
    topicSlug: "rlc-circuit-analysis",
    questionContent:
      "In the circuit shown in the figure above, a 100-ohm resistor is connected in series with a practical inductor. The practical inductor has a resistance of 10-ohm, and an unknown inductance L. Suppose the phase angle of the voltage vR(t) is found to be –35° with respect to the source voltage vS(t), what is the voltage across the practical inductor vPL(t)?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
];

export const Answers: Answer[] = [
  {
    questionId: 1,
    optionNumber: 1,
    answerContent: "0.2A",
    isCorrect: true,
  },
  {
    questionId: 1,
    optionNumber: 2,
    answerContent: "1A",
    isCorrect: false,
  },
  {
    questionId: 1,
    optionNumber: 3,
    answerContent: "0.6A",
    isCorrect: false,
  },
  {
    questionId: 1,
    optionNumber: 4,
    answerContent: "0.8A",
    isCorrect: false,
  },
  {
    questionId: 2,
    optionNumber: 1,
    answerContent: "2mV",
    isCorrect: true,
  },
  {
    questionId: 2,
    optionNumber: 2,
    answerContent: "2.5V",
    isCorrect: false,
  },
  {
    questionId: 2,
    optionNumber: 3,
    answerContent: "10V",
    isCorrect: false,
  },
  {
    questionId: 2,
    optionNumber: 4,
    answerContent: "0.2V",
    isCorrect: false,
  },
  {
    questionId: 3,
    optionNumber: 1,
    answerContent: "0.67V",
    isCorrect: true,
  },
  {
    questionId: 3,
    optionNumber: 2,
    answerContent: "1V",
    isCorrect: false,
  },
  {
    questionId: 3,
    optionNumber: 3,
    answerContent: "-0.67V",
    isCorrect: false,
  },
  {
    questionId: 3,
    optionNumber: 4,
    answerContent: "-1V",
    isCorrect: false,
  },
  {
    questionId: 4,
    optionNumber: 1,
    answerContent: "\\(4~\\Omega\\)",
    isCorrect: true,
  },
  {
    questionId: 4,
    optionNumber: 2,
    answerContent: "\\(11~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 4,
    optionNumber: 3,
    answerContent: "\\(10.2~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 4,
    optionNumber: 4,
    answerContent: "\\(20.8~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 5,
    optionNumber: 1,
    answerContent: "113mW",
    isCorrect: true,
  },
  {
    questionId: 5,
    optionNumber: 2,
    answerContent: "173mW",
    isCorrect: false,
  },
  {
    questionId: 5,
    optionNumber: 3,
    answerContent: "163mW",
    isCorrect: false,
  },
  {
    questionId: 5,
    optionNumber: 4,
    answerContent: "703mW",
    isCorrect: false,
  },
  {
    questionId: 6,
    optionNumber: 1,
    answerContent: "\\(V_T = 7~V,~~~~~R_T = 1.2~\\Omega\\)",
    isCorrect: true,
  },
  {
    questionId: 6,
    optionNumber: 2,
    answerContent: "\\(V_T = 7~V,~~~~~R_T = 1.33~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 6,
    optionNumber: 3,
    answerContent: "\\(V_T = 7.4~V,~~~~~R_T = 1.2~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 6,
    optionNumber: 4,
    answerContent: "\\(V_T = 7.4~V,~~~~~R_T = 1.33~\\Omega\\)",
    isCorrect: false,
  },
  {
    questionId: 7,
    optionNumber: 1,
    answerContent: "3.83V",
    isCorrect: true,
  },
  {
    questionId: 7,
    optionNumber: 2,
    answerContent: "4V",
    isCorrect: false,
  },
  {
    questionId: 7,
    optionNumber: 3,
    answerContent: "4.13V",
    isCorrect: false,
  },
  {
    questionId: 7,
    optionNumber: 4,
    answerContent: "4.24V",
    isCorrect: false,
  },
  {
    questionId: 8,
    optionNumber: 1,
    answerContent:
      "Battery B is being recharged;  Power lost in Battery B's internal resistance is 0.365mW.",
    isCorrect: true,
  },
  {
    questionId: 8,
    optionNumber: 2,
    answerContent:
      "Battery B is being recharged;  Power lost in Battery B's internal resistance is 36.5mW.",
    isCorrect: false,
  },
  {
    questionId: 8,
    optionNumber: 3,
    answerContent:
      "Battery B is being discharged;  Power lost in Battery B's internal resistance is 0.365mW.",
    isCorrect: false,
  },
  {
    questionId: 8,
    optionNumber: 4,
    answerContent:
      "Battery B is being discharged;  Power lost in Battery B's internal resistance is 36.5mW.",
    isCorrect: false,
  },
  {
    questionId: 9,
    optionNumber: 1,
    answerContent: "83.8ms",
    isCorrect: true,
  },
  {
    questionId: 9,
    optionNumber: 2,
    answerContent: "377ms",
    isCorrect: false,
  },
  {
    questionId: 9,
    optionNumber: 3,
    answerContent: "18.6ms",
    isCorrect: false,
  },
  {
    questionId: 9,
    optionNumber: 4,
    answerContent: "44.5ms",
    isCorrect: false,
  },
  {
    questionId: 10,
    optionNumber: 1,
    answerContent: "0.74F",
    isCorrect: true,
  },
  {
    questionId: 10,
    optionNumber: 2,
    answerContent: "0.863F",
    isCorrect: false,
  },
  {
    questionId: 10,
    optionNumber: 3,
    answerContent: "0.987F",
    isCorrect: false,
  },
  {
    questionId: 10,
    optionNumber: 4,
    answerContent: "1.11F",
    isCorrect: false,
  },
  {
    questionId: 11,
    optionNumber: 1,
    answerContent: "56.9 cos(100t - 129.3°)",
    isCorrect: true,
  },
  {
    questionId: 11,
    optionNumber: 2,
    answerContent: "80.4 cos(100t - 84.3°)",
    isCorrect: false,
  },
  {
    questionId: 11,
    optionNumber: 3,
    answerContent: "1.13 cos(100t + 129.3°)",
    isCorrect: false,
  },
  {
    questionId: 11,
    optionNumber: 4,
    answerContent: "56.9 cos(100t - 39.3°)",
    isCorrect: false,
  },
  {
    questionId: 12,
    optionNumber: 1,
    answerContent: "2.89 cos(100t + 47.6°)",
    isCorrect: true,
  },
  {
    questionId: 12,
    optionNumber: 2,
    answerContent: "3.34 cos(100t + 55°)",
    isCorrect: false,
  },
  {
    questionId: 12,
    optionNumber: 3,
    answerContent: "3.55 cos(100t + 39.8°)",
    isCorrect: false,
  },
  {
    questionId: 12,
    optionNumber: 4,
    answerContent: "4.1 cos(100t + 31.4°)",
    isCorrect: false,
  },
];

export const QuestionMedias: QuestionMedia[] = [
  {
    questionId: 1,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q01-1_bzugpn.png",
  },
  {
    questionId: 2,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q02-1_ujltou.png",
  },
  {
    questionId: 3,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075351/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q03-1_ah6aen.png",
  },
  {
    questionId: 4,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q04_gxwt6z.png",
  },
  {
    questionId: 5,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q05-1_dbyrie.png",
  },
  {
    questionId: 6,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q06-1_inu8j6.png",
  },
  {
    questionId: 7,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075184/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q07-1_l9qdr1.png",
  },
  {
    questionId: 8,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q08-1_aq5z1i.png",
  },
  {
    questionId: 9,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q09_bxprfz.png",
  },
  {
    questionId: 10,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q10_uvao4q.png",
  },
  {
    questionId: 11,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q11-1_yh1hrm.png",
  },
  {
    questionId: 12,
    questionMediaURL:
      "https://res.cloudinary.com/dy2tqc45y/image/upload/v1664075350/LeetNode/CG1111_2122_Q1/AY2122-Quiz1-Q12_qiopxh.png",
  },
];
