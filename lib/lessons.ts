import type { Lesson } from "./types";

/**
 * Reusable lesson data structure.
 * Future lessons can be added here without touching UI components.
 *
 * Part 5 scope:
 *  - The Temperature Sensors lesson now carries kit-authentic content:
 *    DHT11 / DS18B20 sensors, Input→Process→Output, ADC conversion, data
 *    logging. A `knowledgeBlock` feeds Gemma with structured teaching context.
 *  - All hardware listed in `requiredHardware` matches the IoT V1 kit.
 *  - Questions are age-targeted (younger: MCQs/TF, older: reasoning).
 *  - The experiment step is wired to the experiment engine via `experimentConfig`.
 *  - No brand references appear in any user-facing text; generic kit
 *    terms ("your IoT kit", "the ESP32 kit", "the sensor kit") are used instead.
 */
export const LESSONS: Lesson[] = [
  {
    id: "lesson-temperature-sensors",
    slug: "temperature-sensors",
    title: "Temperature Sensors",
    tagline: "Read the world in degrees",
    description:
      "Discover how temperature sensors detect changes in the world around us and learn how computers use sensor data.",
    objectives: [
      { text: "Understand what a sensor is (Input)." },
      { text: "Understand the Input → Process → Output cycle in an IoT system." },
      { text: "Understand how temperature sensors convert heat into a signal." },
      { text: "Recognise IoT temperature sensors: DHT11 and DS18B20." },
    ],
    requiredHardware: [
      "ESP32 Development Board",
      "DHT11 Temperature & Humidity Sensor",
      "DS18B20 Waterproof Temperature Probe",
      "IoT Sensor Kit PCB",
    ],
    concepts: [
      {
        id: "concept-iot-cycle",
        title: "Input → Process → Output",
        summary:
          "Every smart device follows a simple cycle: a sensor reads the world (Input), a microcontroller like the ESP32 decides what to do (Process), and the result is shown or used (Output).",
        detail:
          "In a temperature sensor system the DHT11 or DS18B20 is the Input — it measures heat. The ESP32 is the Process — it reads the signal from the sensor and turns it into a number. The Output could be the LCD display, the web dashboard, or even a relay switching a fan on.",
        everydayExample:
          "Your body works the same way: your skin feels heat (Input), your brain decides it's too hot (Process), and you sweat to cool down (Output).",
      },
      {
        id: "concept-dht11",
        title: "The DHT11 sensor (temperature + humidity)",
        summary:
          "The DHT11 is a digital sensor that measures both temperature and humidity. It sends its readings over a single data wire to the ESP32.",
        detail:
          "The DHT11 uses a digital communication protocol: it sends a series of electrical pulses that the ESP32 counts and decodes into temperature (in °C) and humidity (in %). You only need three connections: power, ground, and a data pin.",
        everydayExample:
          "Think of the DHT11 like a tiny weather station in your room — it can tell you 'It's 25 °C and the air is 65% humid'.",
      },
      {
        id: "concept-ds18b20",
        title: "The DS18B20 sensor (precision probe)",
        summary:
          "The DS18B20 is a waterproof temperature probe that uses the One-Wire protocol. It's more accurate than the DHT11 and can be submerged in liquids.",
        detail:
          "Unlike the DHT11, the DS18B20 only measures temperature but does so very precisely. Its steel casing makes it waterproof, so you can measure the temperature of water, soil, or even your hand. It also uses a digital protocol (One-Wire), meaning multiple sensors can share the same data pin.",
        everydayExample:
          "A DS18B20 is like a kitchen thermometer probe — you can dip it into a cup of tea to find out exactly how hot it is.",
      },
      {
        id: "concept-adc",
        title: "From signal to number (ADC)",
        summary:
          "The ESP32's built-in ADC (Analogue-to-Digital Converter) translates the sensor's electrical signal into a number the computer can work with.",
        detail:
          "Some sensors (like the LDR light sensor) produce a voltage that changes smoothly — an 'analogue' signal. The ADC measures this voltage thousands of times and uses averaging (4 readings at a time in your IoT kit) to produce a stable digital number.",
        everydayExample:
          "When your phone shows you a battery percentage, an ADC inside measured the battery's voltage and turned it into the number you see.",
      },
    ],
    knowledgeBlock: `IoT KIT TEMPERATURE SENSORS (FACTS FOR TEACHING):
- The IoT kit includes two temperature sensors: DHT11 (combined temperature + humidity, digital protocol) and DS18B20 (waterproof precision probe, One-Wire protocol).
- The DHT11 connects via a 3-pin header to GPIO 25. It reports temperature in °C and humidity in %. Readings update roughly every 2 seconds.
- The DS18B20 connects via a 3-pin header to GPIO 26. It only reports temperature but is more accurate and waterproof.
- The ESP32 reads sensor signals and converts them to numbers using its ADC (Analogue-to-Digital Converter). The kit's firmware averages 4 readings for cleaner data.
- Temperature is always reported in degrees Celsius (°C) on the dashboard.
- The IoT Input→Process→Output cycle: the sensor (Input) measures the physical world, the ESP32 microcontroller (Process) reads and converts the signal, and the result appears on the dashboard/LCD (Output).
- Data logging is at the heart of IoT: the ESP32 takes a temperature reading every 2 seconds and streams it via WebSocket to the dashboard. Over time these readings form a dataset that shows how temperature changes.
- The DHT11 measurement range is roughly 0–50 °C with ±2 °C accuracy. The DS18B20 range is -55 to +125 °C with ±0.5 °C accuracy.`,
    steps: [
      {
        id: "step-1-introduction",
        title: "Introduction",
        kind: "introduction",
        summary:
          "Welcome to the Temperature Sensors lesson. We'll discover how your IoT kit measures temperature with two different sensors — and why that matters in the world of IoT.",
        objectives: [
          { text: "Understand what a sensor is (Input in IoT)." },
          { text: "Understand the Input → Process → Output model." },
          { text: "Know the two IoT kit temperature sensors: DHT11 and DS18B20." },
        ],
      },
      {
        id: "step-2-what-is-a-sensor",
        title: "What is a Sensor?",
        kind: "content",
        summary:
          "Every IoT system starts with Input. A sensor is the bridge between the real world and the digital one.",
        objectives: [
          { text: "Explain the Input → Process → Output cycle." },
          { text: "Identify the sensor as the 'Input' in an IoT system." },
          { text: "Name the ESP32 as the 'Process' and the dashboard/display as the 'Output'." },
        ],
        concepts: [
          {
            id: "concept-sensor-input",
            title: "The sensor as Input",
            summary:
              "A sensor is the 'eyes and ears' of a computer. It picks up real-world events — heat, light, sound, motion — and turns them into electrical signals.",
            detail:
              "In the kit's IoT system the sensor (like the DHT11) is the Input. The ESP32 microcontroller is the Process — it reads the sensor and turns the signal into a number. The dashboard or LCD is the Output — it shows you the reading. Everything in IoT follows this Input→Process→Output cycle.",
            everydayExample:
              "A digital thermometer takes a temperature reading (Input), the chip inside does a calculation (Process), and the screen shows a number (Output).",
          },
        ],
        activity: {
          id: "activity-spot-sensors",
          title: "Spot the Inputs around you",
          brief: "How many Input→Process→Output cycles do you interact with every day?",
          instructions: [
            "Name three everyday objects that contain a sensor (Input).",
            "For each one, describe what happens in the Process and Output stages.",
            "Share your examples with Gemma and ask if they agree.",
          ],
        },
      },
      {
        id: "step-3-temperature-sensors",
        title: "Temperature Sensors",
        kind: "content",
        summary:
          "Your IoT kit has two temperature sensors: the DHT11 (temperature + humidity) and the DS18B20 (a waterproof precision probe). Each works differently.",
        objectives: [
          { text: "Describe the difference between the DHT11 and DS18B20." },
          { text: "Explain what the ADC does to turn a sensor signal into a number." },
          { text: "Know the units for temperature readings are degrees Celsius (°C)." },
        ],
        concepts: [
          {
            id: "concept-dht11-step",
            title: "DHT11 — temperature and humidity together",
            summary:
              "The DHT11 measures air temperature and humidity using a digital protocol on a single data wire connected to the ESP32.",
            detail:
              "Inside the DHT11 a tiny chip measures heat and moisture. It sends these readings as digital pulses — a pattern of high and low voltages — which the ESP32 counts and decodes into °C and %. The kit reads the DHT11 roughly every 2 seconds.",
            everydayExample:
              "Think of the DHT11 as a little digital weather spinner that lets you know if your room is comfortable.",
          },
          {
            id: "concept-ds18b20-step",
            title: "DS18B20 — precision in a steel jacket",
            summary:
              "The DS18B20 is a waterproof temperature probe that gives very accurate readings, even underwater or in soil.",
            detail:
              "Unlike the DHT11, the DS18B20 measures only temperature — but it does so with greater precision (±0.5 °C). Its stainless-steel case makes it waterproof. Multiple DS18B20 sensors can share the same wire using the One-Wire protocol.",
            everydayExample:
              "A DS18B20 is like a digital kitchen thermometer: dip it in a drink or puddle and read the exact temperature.",
          },
        ],
        activity: {
          id: "activity-compare-sensors",
          title: "Compare the two sensors",
          brief: "Think about which sensor you'd use in different situations.",
          instructions: [
            "Situation A: you want to know if a room is getting too humid. Which sensor would help more, and why?",
            "Situation B: you need to measure the temperature of a cup of water. Which sensor is better suited, and why?",
            "Write down your reasoning for each, then ask Gemma for feedback.",
          ],
          note: "The DHT11 does humidity too — the DS18B20 does not. But the DS18B20 is waterproof.",
        },
      },
      {
        id: "step-4-prepare-experiment",
        title: "Prepare the Experiment",
        kind: "prepare-experiment",
        summary:
          "Get ready to take live temperature readings. In this step you'll plan what to measure and how — using what you know about the DHT11 and DS18B20.",
        objectives: [
          { text: "Design a simple temperature data-logging experiment." },
          { text: "Predict how temperature readings will change over time." },
          { text: "Choose the right sensor for the measurement." },
        ],
        concepts: [
          {
            id: "concept-data-logging",
            title: "Data logging — IoT in action",
            summary:
              "IoT isn't just about reading a sensor once — it's about taking regular readings and watching how things change over time.",
            detail:
              "Your IoT kit streams sensor data every 2 seconds via WebSocket to the dashboard. A data logger records many readings in sequence, showing a trend: is it getting hotter, colder, or staying the same? This is how weather stations, smart fridges, and factory monitors work.",
            everydayExample:
              "If you take your temperature every hour when you're sick and write the numbers down, you're doing data logging — just like IoT devices do.",
          },
        ],
        activity: {
          id: "activity-plan-experiment",
          title: "Plan your data-logging experiment",
          brief: "Design a simple experiment to measure temperature and watch it change over time. You'll run it with hardware in the next part.",
          instructions: [
            "Choose a temperature to measure (room air, a cooling cup of water, your palm…).",
            "Decide how often to take readings (you can match the kit's 2-second interval or choose your own).",
            "Predict what the temperature will look like after 5 readings.",
            "Decide which sensor fits best: DHT11 (air) or DS18B20 (touch / liquid).",
            "Tell Gemma your plan — they'll help you think through whether it makes sense.",
          ],
          note: "No hardware needed yet — you're planning the experiment so you're ready when the kit arrives.",
        },
      },
      {
        id: "step-5-experiment",
        title: "Experiment",
        kind: "experiment",
        summary:
          "Hands-on experiment with your IoT sensor kit. Connect your DS18B20 temperature sensor, capture live readings, and observe how the data changes in real time.",
        experimentConfig: {
          baselineStabilityWindow: 5,
          baselineStabilityThreshold: 1.0,
          coldWaterDeltaThreshold: 3.0,
          warmWaterDeltaThreshold: 3.0,
          coldWaterTimeoutSec: 60,
          warmWaterTimeoutSec: 60,
          minReadingsPerPhase: 3,
        },
      },
      {
        id: "step-6-knowledge-check",
        title: "Knowledge Check",
        kind: "knowledge-check",
        summary:
          "A short set of questions to confirm what you've learned. Questions adjust to your age — younger students get simple multiple-choice, older students get reasoning challenges.",
        questions: [
          {
            id: "kc-q1-mc-young",
            type: "multiple-choice",
            minAge: 5,
            prompt: "What job does a sensor do in a smart device?",
            options: [
              "It feels things like heat or light",
              "It makes the computer faster",
              "It stores your files",
              "It talks to the internet",
            ],
            correctIndex: 0,
            explanation:
              "A sensor is the Input — it picks up what's happening in the real world (heat, light, motion) and sends that information to the computer.",
          },
          {
            id: "kc-q1-mc-older",
            type: "multiple-choice",
            minAge: 13,
            prompt: "In the IoT kit's Input→Process→Output model, which component is the 'Process'?",
            options: [
              "The ESP32 microcontroller",
              "The DHT11 sensor",
              "The LCD display",
              "The web dashboard",
            ],
            correctIndex: 0,
            explanation:
              "Correct. The ESP32 is the Process step — it reads the sensor signal (Input), converts it via ADC, and sends the number to the dashboard (Output).",
          },
          {
            id: "kc-q2-tf",
            type: "true-false",
            prompt: "The DHT11 measures both temperature and humidity, while the DS18B20 measures only temperature but is more precise.",
            correct: true,
            explanation:
              "True. The DHT11 is a two-in-one sensor (±2 °C accuracy) and the DS18B20 is a precision probe (±0.5 °C) that is also waterproof.",
          },
          {
            id: "kc-q3-mc",
            type: "multiple-choice",
            prompt: "Why does the kit's ESP32 use the ADC when reading some sensors?",
            options: [
              "To convert an electrical signal into a number the computer can use",
              "To store data for later",
              "To speed up the WiFi connection",
              "To power the sensors",
            ],
            correctIndex: 0,
            explanation:
              "The ADC (Analogue-to-Digital Converter) turns the sensor's continuous electrical signal into a digital number the program can display or log.",
          },
          {
            id: "kc-q4-tf-older",
            type: "true-false",
            minAge: 13,
            prompt: "The DS18B20 sensor uses the One-Wire protocol, meaning multiple DS18B20 sensors can share the same data pin on the ESP32.",
            correct: true,
            explanation:
              "True — the One-Wire protocol lets many sensors connect to a single GPIO pin, each with its own unique address.",
          },
          {
            id: "kc-q5-reasoning",
            type: "multiple-choice",
            minAge: 13,
            prompt: "You place a DS18B20 probe in a cup of warm water and watch the readings for 3 minutes. The numbers go from 55 °C down to 38 °C. What does this tell you?",
            options: [
              "The water is cooling down at a steady pace",
              "The sensor must be faulty",
              "The water temperature increased over time",
              "The ESP32 stopped processing",
            ],
            correctIndex: 0,
            explanation:
              "A steady drop in readings over time shows the water is losing heat to the surrounding air. This is essentially data logging — watching how temperature changes moment by moment.",
          },
        ],
      },
      {
        id: "step-7-final-assessment",
        title: "Final Assessment",
        kind: "assessment",
        summary:
          "Final AI-scored assessment to complete the lesson and earn your Temperature Sensors badge.",
        assessment: [
          {
            id: "fa-q1-tf-young",
            type: "true-false",
            minAge: 5,
            prompt: "Temperature is measured in degrees Celsius on the dashboard.",
            correct: true,
            explanation: "Yes! The kit always shows temperature in degrees Celsius (°C).",
          },
          {
            id: "fa-q1-tf-older",
            type: "true-false",
            minAge: 13,
            prompt: "The ESP32 reads sensors by polling them over HTTP.",
            correct: false,
            explanation:
              "No — the kit uses WebSocket streaming, not HTTP polling. Sensor data is pushed automatically every 2 seconds.",
          },
          {
            id: "fa-q2-mc",
            type: "multiple-choice",
            prompt: "You add an ice cube to your water cup and the DS18B20 readings drop sharply. What stage of the IoT cycle is the sensor?",
            options: ["Input", "Process", "Output", "Storage"],
            correctIndex: 0,
            explanation:
              "Correct — the sensor is always the Input stage. It detects the drop in temperature and sends the electrical signal to the ESP32.",
          },
          {
            id: "fa-q3-reasoning",
            type: "multiple-choice",
            minAge: 13,
            prompt: "You have one DHT11 and one DS18B20 connected to the same ESP32. The DHT11 reads 24 °C and the DS18B20 reads 22.5 °C. Why might the numbers differ?",
            options: [
              "Each sensor has a different accuracy and measures from a different location",
              "The DS18B20 is broken if it doesn't match",
              "The kit only supports one sensor at a time",
              "Temperature doesn't vary, so one sensor must be wrong",
            ],
            correctIndex: 0,
            explanation:
              "Different sensors have different accuracies (DHT11: ±2 °C, DS18B20: ±0.5 °C) and their physical placement means they may sense slightly different conditions. Neither is necessarily wrong — the DS18B20 is simply more precise.",
          },
          {
            id: "fa-q4-open",
            type: "open-ended",
            prompt: "Explain in your own words how a temperature sensor works and why computers need sensors to understand the physical world.",
            minAge: 8,
            expectedConcepts: [
              "sensor converts heat/temperature into an electrical signal",
              "computer/microcontroller reads and converts the signal to a number",
              "ADC or analog-to-digital conversion",
              "temperature measured in degrees Celsius",
              "computers cannot sense the physical world directly without sensors",
            ],
            modelAnswer: "A temperature sensor detects heat by changing its electrical behaviour (like resistance or voltage) as it gets warmer or cooler. The ESP32 reads this changing signal and uses an ADC to convert it into a number (degrees Celsius). Computers need sensors because they can only process digital data — they have no way to directly feel heat, light, or pressure without a sensor converting the physical world into numbers.",
          },
        ],
      },
    ],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getTotalSteps(lesson: Lesson): number {
  return lesson.steps.length;
}