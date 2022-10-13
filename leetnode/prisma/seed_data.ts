import { TopicLevel, QuestionDifficulty } from "@prisma/client";

export const Topics = [
  {
    topicSlug: "power",
    topicName: "Power = V x I",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "ohms-law",
    topicName: "Ohm's Law",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "kvl",
    topicName: "KVL",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "kcl",
    topicName: "KCL",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "thevenin-equivalent-circuit",
    topicName: "Thevenin Equivalent Circuit",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "equivalent-resistance",
    topicName: "Equivalent Resistance when Connected in Series or Parallel",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "voltage-division-principle",
    topicName: "Voltage Division Principle",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "current-division-principle",
    topicName: "Current Division Principle",
    topicLevel: TopicLevel.Foundational,
  },
  {
    topicSlug: "node-voltage-analysis-technique",
    topicName: "Node Voltage Analysis Technique",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "rlc-steady-state-analysis",
    topicName: "Steady State Analysis of RLC Circuits",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "rc-and-rl-transient-analysis",
    topicName:
      "Transient Analysis of Series RC Circuits and Series RL Circuits",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "equivalent-capacitance",
    topicName: "Equivalent Capacitance When Connected in Series or Parallel",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "equivalent-inductance",
    topicName: "Equivalent Inductance When Connected in Series or Parallel",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "energy-stored-in-capacitors-inductors",
    topicName: "Energy Stored in Capacitors, Inductors",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "pmdc-motors-circuit-model",
    topicName: "Electrical Circuit Model of PMDC Motors",
    topicLevel: TopicLevel.Intermediate,
  },
  {
    topicSlug: "torque-equation",
    topicName: "Torque Equation",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "dc-motors-power-calculation",
    topicName:
      "Calculation of Mechanical Power & Electrical Power of DC Motors",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "inverting-non-inverting-amplifiers-gains",
    topicName: "Gains of Inverting and Non-Inverting Amplifiers",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "opamp-golden-rules",
    topicName: "Op-Amp Golden Rules",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "opamp-circuit-analysis",
    topicName: "Analysis of Circuits Containing Op-Amps",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "first-order-low-pass-filters",
    topicName: "First Order Low Pass Filters",
    topicLevel: TopicLevel.Advanced,
  },
  {
    topicSlug: "first-order-high-pass-filters",
    topicName: "First Order High Pass Filters",
    topicLevel: TopicLevel.Advanced,
  },
];

export const Courses = Topics.map((topic) => ({
  courseSlug: topic.topicSlug,
  courseName: topic.topicName,
}));

export const Questions = [
  {
    questionId: 1,
    topicSlug: "ohms-law",
    questionContent:
      "For the circuit shown in the figure above, what is the value of current I1?",
    questionDifficulty: QuestionDifficulty.Easy,
  },
  {
    questionId: 2,
    topicSlug: "voltage-division-principle",
    questionContent:
      "For the circuit shown in the figure above, what is the voltage V1?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 3,
    topicSlug: "equivalent-resistance",
    questionContent:
      "A current of 3 A flows through a resistor network as shown in the figure above. The voltage difference \\(V_{XY}\\) (given by \\(V_X\\) - \\(V_Y\\)) is",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 4,
    topicSlug: "thevenin-equivalent-circuit",
    questionContent:
      "What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 5,
    topicSlug: "voltage-division-principle",
    questionContent:
      "What is the maximum power that can be utilized by the variable load R?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 6,
    topicSlug: "thevenin-equivalent-circuit",
    questionContent:
      "For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 7,
    topicSlug: "node-voltage-analysis-technique",
    questionContent:
      "For the circuit shown in the figure above, what is the node voltage VA?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 8,
    topicSlug: "voltage-division-principle",
    questionContent:
      "For the circuit shown in the figure above, is Battery B being recharged or discharged? What is the power lost in Battery B's internal resistance?",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 9,
    topicSlug: "rc-and-rl-transient-analysis",
    questionContent:
      "In the circuit shown in the figure above, the two switches were opened for a very long time before time t = 0. At time t = 0, both the switches are closed simultaneously. How long does it take for the voltage VL(t) to fall to 7 V after the switches are closed?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
  {
    questionId: 10,
    topicSlug: "rc-and-rl-transient-analysis",
    questionContent:
      "In the circuit shown in the figure above, the capacitor was fully discharged initially. At time t = 0, the switch is closed. If it takes 6 s for the practical capacitor's voltage VPC(t) to rise to 6 V, what is the value of capacitance C?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
  {
    questionId: 11,
    topicSlug: "rlc-steady-state-analysis",
    questionContent:
      "In the circuit shown in the figure above, the capacitor's voltage vC(t) is",
    questionDifficulty: QuestionDifficulty.Medium,
  },
  {
    questionId: 12,
    topicSlug: "rlc-steady-state-analysis",
    questionContent:
      "In the circuit shown in the figure above, a 100-ohm resistor is connected in series with a practical inductor. The practical inductor has a resistance of 10-ohm, and an unknown inductance L. Suppose the phase angle of the voltage vR(t) is found to be –35° with respect to the source voltage vS(t), what is the voltage across the practical inductor vPL(t)?",
    questionDifficulty: QuestionDifficulty.Hard,
  },
];

export const Answers = [
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

export const QuestionMedias = [
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
