const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Experiment = require('../models/Experiment');

// Get experiments by level
router.get('/', auth, async (req, res) => {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};
    const experiments = await Experiment.find(filter);
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single experiment
router.get('/:id', auth, async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
    res.json(experiment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed experiments (development only)
router.post('/seed', async (req, res) => {
  try {
    await Experiment.deleteMany({});
    const experiments = [
      {
        title: 'Electric Circuit Simulation',
        subject: 'Physics',
        category: 'Electricity',
        level: 'high',
        description: 'Build a simple electrical circuit using a battery, bulb, wires, and switch.',
        instructions: [
          'Connect the battery positive terminal to the switch',
          'Connect the switch to the light bulb',
          'Connect the light bulb back to the battery negative terminal',
          'Toggle the switch to complete the circuit and light up the bulb'
        ],
        quiz: [
          {
            question: 'What happens when you close the switch in a complete circuit?',
            options: ['Nothing happens', 'The bulb lights up', 'The battery explodes', 'The wire melts'],
            correctAnswer: 1
          },
          {
            question: 'What is needed for current to flow in a circuit?',
            options: ['An open switch', 'A complete closed path', 'Only a battery', 'Only a bulb'],
            correctAnswer: 1
          },
          {
            question: 'What does a switch do in a circuit?',
            options: ['Produces electricity', 'Controls the flow of current', 'Stores energy', 'Converts light to electricity'],
            correctAnswer: 1
          }
        ]
      },
      {
        title: 'Free Fall Simulation',
        subject: 'Physics',
        category: 'Mechanics',
        level: 'high',
        description: 'Study the motion of objects under gravity.',
        instructions: [
          'Select an object to drop',
          'Observe how it falls under gravity',
          'Measure the time it takes to reach the ground',
          'Calculate the speed using v = g × t'
        ],
        quiz: [
          {
            question: 'What is the acceleration due to gravity on Earth?',
            options: ['5 m/s²', '9.8 m/s²', '15 m/s²', '20 m/s²'],
            correctAnswer: 1
          }
        ]
      },
      {
        title: 'Test for Mercurous Radical',
        subject: 'Chemistry',
        category: 'Inorganic Chemistry',
        level: 'high',
        description: 'Learn to identify the mercurous radical using chemical tests.',
        instructions: [
          'Take a sample of the unknown compound',
          'Add dilute HCl to the sample',
          'Observe the white precipitate formation',
          'Confirm with ammonia solution'
        ],
        quiz: [
          {
            question: 'What precipitate forms when Hg₂²⁺ reacts with HCl?',
            options: ['HgCl₂', 'Hg₂Cl₂', 'HgO', 'Hg₂O'],
            correctAnswer: 1
          }
        ]
      },
      {
        title: 'Photosynthesis Process',
        subject: 'Natural Sciences',
        category: 'Biology',
        level: 'middle',
        description: 'Explore how plants convert light into energy.',
        instructions: [
          'Set up a plant under controlled light',
          'Observe gas production',
          'Measure oxygen output',
          'Record results'
        ],
        quiz: [
          {
            question: 'What gas do plants produce during photosynthesis?',
            options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
            correctAnswer: 2
          }
        ]
      },
      {
        title: 'Simple Pendulum',
        subject: 'Physics',
        category: 'Mechanics',
        level: 'middle',
        description: 'Study oscillatory motion with a pendulum.',
        instructions: [
          'Set up pendulum with given length',
          'Displace it by a small angle',
          'Release and count oscillations',
          'Calculate period'
        ],
        quiz: [
          {
            question: 'What affects the period of a pendulum?',
            options: ['Mass', 'Length', 'Color', 'Material'],
            correctAnswer: 1
          }
        ]
      },
      {
        title: 'States of Matter',
        subject: 'Scientific Education',
        category: 'General Science',
        level: 'primary',
        description: 'Learn about solid, liquid, and gas states.',
        instructions: [
          'Observe ice melting',
          'Watch water boiling',
          'Record temperature changes',
          'Draw conclusions'
        ],
        quiz: [
          {
            question: 'Which state of matter has a fixed shape?',
            options: ['Gas', 'Liquid', 'Solid', 'Plasma'],
            correctAnswer: 2
          }
        ]
      }
    ];
    await Experiment.insertMany(experiments);
    res.json({ message: 'Experiments seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
