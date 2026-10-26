# TRL assessment

**TRL 4.** Component behavior was checked with a local unit test. The timetable status and entrance motion exist only as local UI code.

This is not TRL 5 or higher. There was no browser run of the app, no relevant environment trial, no user study, no deployment, and no certification.

Evidence:

- `src/utils/timetableMotion.ts` chooses entrance and generate/loading/result motion.
- `src/utils/timetableMotion.test.ts` covers reduced motion and the motion branch.
- The test command was the project `npm test` script. It was not a hosted or operational evaluation.
