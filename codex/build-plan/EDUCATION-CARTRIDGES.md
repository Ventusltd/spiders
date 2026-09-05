# Energy Quest: engineering through small interactive experiments

Proposed educational extension, 2026-09-05. This does not add completed releases or renumber the canonical 50+50 app plan. The published clock board is a first visual vocabulary, not a validated engineering simulator.

## Shared teaching interaction

Predict → change one input → observe → explain. A segmented bar gives an immediate result; a small waveform or diagram explains it. Offer Explore, Explain and Engineering detail on the same model rather than unrelated child/adult implementations. Every screen identifies units, model assumptions, source date and whether its values are simulated, calculated or observed.

The central control is a time microscope: pause, single-step and change the represented timescale from semiconductor switching to protection events, daily energy and climate response. Display physical time separately from animation time. A fast browser counter is not evidence of high-frequency instrument sampling; switching waveforms must be analytically sampled and deliberately slowed to avoid misleading aliasing.

## Candidate cartridges

| Cartridge | Learner control | Visible response and teaching question | Proposed owner boundary |
|---|---|---|---|
| Earth energy balance | Change reflected sunlight / outgoing energy in a declared simplified model | Incoming/outgoing energy bars and accumulated imbalance; why does a persistent difference matter? | Studies model; independent UI plugin |
| Earth rotation | Move latitude | Distance travelled by a surface point through rotation, with latitude and reference frame explicit | Studies model; shared tiny renderer |
| Earth orbit | Advance simulation time | Orbital distance, period and changing speed; distinguish orbit from spin | Studies model; separate reference data |
| Power versus energy | Change load and elapsed time | kW versus kWh; distinguish instantaneous power from accumulated energy | Ventus grid engine educational adapter |
| Cable heating | Change current, conductor area and length | Resistive loss and voltage drop; show stated assumptions before introducing thermal limits | Cable-trench-or-drill model owner |
| Fault and protection timeline | Change source impedance and clearing delay | Fault-current trace and approximate accumulated I-squared-t; distinguish prospective current from protection timing | Ventus grid engine; attributed protection model |
| Frequency balance | Step demand / generation; enable modeled response | Frequency deviation, response and recovery; do not equate frequency with voltage | Grid engine model; electricity data optional |
| Semiconductor switch | Change switching frequency / duty cycle | Conduction and switching-loss components, with device-model limitations visible | Compute/engine owner to be confirmed |
| PWM microscope | Change pulse width and modulation | Switch pulses, averaged waveform and filtered output on linked time axes | Reusable inverter model plugin |
| Harmonic spectrum | Change switching/filter parameters | Fundamental and harmonic bars plus waveform; distinguish switching frequency from grid frequency | Same inverter model, separate view cartridge |
| Battery dispatch | Change charge/discharge power and duration | State of charge, losses and grid import/export; MW is not MWh | GIS SLD / grid engine model adapter |
| Engineering clock | Change displayed timescale | Milliseconds, seconds, days and years compared honestly; 2050 is a stated target date, not a calculated physical deadline | Shared UI only |

Owners above are proposals, not migrations. Reuse existing validated models before creating new ones. Do not overload Ventus Core with educational UI or duplicate existing data archives. Keep each independently versioned model, renderer, lesson text and data adapter separable. GridAtlas integration must reuse its existing layer registry through an appropriate UI-plugin adapter; do not pass an interactive app off as a GeoJSON line layer.

## Precision and publication gates

Each cartridge requires: one explicit question; a complete reviewed model boundary; authoritative references; dimensional checks; known-answer and limiting-case fixtures; time-scaling tests; an accessible nonanimated mode; and Chrome phone/desktop verification. A reviewer must approve the scope of any simplified electrical calculation. Fault current, clearing time, grid frequency and study execution time always have separate units and labels.

Examples of model checks: zero current yields zero resistive heating; limiting latitude behavior is correct; energy accumulation uses consistent time units; displayed milliseconds correspond to the model clock; a missing optional data feed does not change simulated values into apparently live measurements. Numerical accuracy and physical applicability are separate acceptance questions.

Keep presentation terminal-simple: monospace labels, a small reusable segmented bar, restrained color and a tiny waveform where it teaches something. No video, heavy framework, fabricated telemetry, or animation used as evidence of progress. Aim for the visual economy of older PCs while acknowledging that the implementation runs in modern browsers.

## Primary starting references

- NASA, Climate and Earth's Energy Budget: https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/
- IPCC AR6 WGI Chapter 7, energy budget, feedbacks and sensitivity: https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/
- NASA reference systems, rotation and orbital motion: https://science.nasa.gov/learn/basics-of-space-flight/chapter2-1/
- NASA Earth learning resource for grades 5–8: https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-earth-grades-5-8/
- NESO, What is frequency?: https://www.neso.energy/energy-101/electricity-explained/how-do-we-balance-grid/what-frequency
- Texas Instruments inverter reference design: https://www.ti.com/lit/ug/tiduay6e/tiduay6e.pdf

These references establish starting concepts, not a completed validated implementation. Select the appropriate current source and standard for each model before publishing its engineering view.
