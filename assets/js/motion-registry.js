/* motion-registry.js: the single description of every Keel animation.
   Read by the case study's Motion Gallery, the motion system page and the
   generated specifications. If an animation changes, change it here.

   tech is exact:
     "Lottie"                    hand-authored Lottie JSON (source/lottie/build.py)
     "Lottie, progress-mapped"   a Lottie whose timeline is linear in one value; the app scrubs to it
     "SVG + JS, data-bound"      drawn from data by assets/js/keel-charts.js; never Lottie, because exact values
   storyboard frames are real frames of the shipped file, not sketches. */
window.KEEL_MOTION = [
  {
    id: 'equilibrium', n: '01', title: 'Hero Equilibrium', tech: 'Lottie', file: 'equilibrium', aspect: '640/360',
    principles: ['Settle', 'Reassure'], where: 'Case study hero, motion system page',
    problem: 'The idea behind Keel (steadiness, not restriction) is abstract. People need to feel it before they read it.',
    intention: 'A balance object starts slightly off level, finds its balance, and holds. The last thing to move is the ember: the person, settling into a steady position.',
    behavior: 'The beam rocks with decaying swings (each keeps about 45% of the last) while the right-hand mass slides into its balanced place. The ember lowers onto the pivot last. Then stillness.',
    trigger: 'Plays once when 35% of it is in view. Holds the final frame. Replay on request.',
    timing: '4.0s at 60fps: rocking 0 to 2.5s, ember 1.6 to 2.6s, hold to 4.0s',
    easing: 'Pendulum swing between extremes, cubic-bezier(0.45, 0, 0.55, 1); the ember on --ease-settle',
    a11y: 'role="img" with a description. Reduced motion shows the settled final frame. Never loops.',
    impl: '<keel-lottie name="equilibrium" trigger="inview" poster="end" label="..."></keel-lottie>',
    storyboard: [[0, 'Off level', 'The beam tips left; the porcelain mass sits too far out.'], [48, 'Response', 'The beam swings past level; the mass begins to slide in.'], [110, 'Balance', 'Swings shrink; the mass reaches its place.'], [156, 'Focal', 'The ember lowers onto the pivot.'], [239, 'Hold', 'Everything at rest.']]
  },
  {
    id: 'line', n: '02', title: 'The Equilibrium Line', tech: 'Lottie, progress-mapped', file: 'line', aspect: '600/120',
    principles: ['Settle', 'Explain'], where: 'Steady screen: spending pace since payday',
    problem: 'A number like $306 in 7 days means nothing without a reference. People need to know whether this stretch is normal.',
    intention: 'A baseline with “your usual” at the center. A marker travels along it and settles where your actual pace is: left is lighter than usual, right is heavier. No red, no warning.',
    behavior: 'Frames 0 to 36 draw the baseline from the center out. Frames 36 to 136 are linear in the value. The app eases the marker to the frame that equals spent ÷ usual for the days since payday.',
    trigger: 'When the Steady screen opens; again whenever spending changes.',
    timing: '0.6s intro, then a 0.9s settle to the value; later changes 0.52s',
    easing: '--ease-settle on the scrub. The timeline itself is linear so position equals value.',
    a11y: 'The sentence next to it states the same fact in words (“$30 lighter than usual”). The element has an aria-label with the percentage.',
    impl: 'line.scrubTo((spent / usual) - 0.5, { from: 36, to: 136 })',
    storyboard: [[0, 'Empty', 'Nothing yet.'], [20, 'Baseline', 'The line draws out from “your usual”.'], [36, 'Scale', 'Ticks in place; the marker appears at the start.'], [86, 'Usual', 'Halfway: exactly your usual pace.'], [136, 'Range end', 'The far right of the scale.']]
  },
  {
    id: 'clarity', n: '03', title: 'Financial Clarity Reveal', tech: 'Lottie', file: 'clarity', aspect: '640/400',
    principles: ['Reveal'], where: 'Case study, the problem',
    problem: 'The difference between “overwhelming” and “clear” is easier to show than to describe, without inventing screenshots of real products.',
    intention: 'Abstract marks (bars, dots, figures) start scattered and rotated, then drift into a ranked list on a baseline, figures right-aligned, the ember marking the row that matters.',
    behavior: 'Each row arrives 8 frames after the one above. The baseline and axis draw in once the order is clear. The ember is last.',
    trigger: 'Plays once in view.',
    timing: '3.6s: rows settle 0.5 to 2.0s, baseline and axis 1.6 to 2.7s, focus 2.5 to 3.1s',
    easing: '--ease-settle throughout',
    a11y: 'Decorative to the argument, so the paragraph beside it carries the meaning. Reduced motion shows the organized end state.',
    impl: '<keel-lottie name="clarity" trigger="inview" poster="end"></keel-lottie>',
    storyboard: [[0, 'Before', 'Nothing.'], [40, 'Scattered', 'Bars, dots and figures at odd angles.'], [90, 'Aligning', 'Rows find their places.'], [150, 'Structure', 'Baseline and axis draw in.'], [215, 'Clear', 'The ember marks the row that matters.']]
  },
  {
    id: 'spending', n: '04', title: 'Spending Insight', tech: 'SVG + JS, data-bound', chart: 'bars',
    principles: ['Explain', 'Connect'], where: 'Spending screen: by category',
    problem: 'When a transaction moves between categories, two totals change at once. If the bars jump, people miss what happened.',
    intention: 'Bars move from their old values to their new ones, so the change itself is visible. A tick marks where each category stood by this point last stretch.',
    behavior: 'Widths are scaleX transforms of exact ratios (value ÷ largest value). Amounts count to the new figure in the same time. First visit reveals the bars in sequence.',
    trigger: 'Opening Spending; saving a new category; filtering.',
    timing: '0.52s (--dur-chart); 40ms stagger on first reveal',
    easing: '--ease-standard, cubic-bezier(0.4, 0, 0.2, 1): a change in place, not an arrival',
    a11y: 'Each row is a button whose label states the amount and the comparison in words. Color is never the only signal: the selected row is also bold and pressed.',
    impl: 'KeelCharts.bars(el, rows, { selected })'
  },
  {
    id: 'goal', n: '05', title: 'Savings Goal Progress', tech: 'Lottie, progress-mapped', file: 'goal', aspect: '600/160',
    principles: ['Explain', 'Settle', 'Reassure'], where: 'Goals: every goal card',
    problem: 'Progress bars are everywhere and say nothing. Adding money should feel like weight being placed, and finishing should feel finished, without confetti.',
    intention: 'An ink ballast fills a mineral well while an ember block rides its leading edge. At 100%, the block lowers into a seat at the end of the well and a capstone line closes the structure.',
    behavior: 'Frames 0 to 200 are linear in progress. The app eases to saved ÷ target × 200. Only at 100% does it play the completion segment, 200 to 260.',
    trigger: 'Goals opens; money is added.',
    timing: '0.9s settle to the value; completion 1.0s',
    easing: '--ease-settle on the scrub; settle inside the completion segment',
    a11y: 'aria-label states saved, target and percent. The figures above it say the same in text.',
    impl: 'goal.scrubTo(saved / target, { from: 0, to: 200 }); if done: goal.playSegment(200, 259)',
    storyboard: [[0, 'Empty', 'The ember block waits at the start of the well.'], [76, '38%', 'The sample goal today: $380 of $1,000.'], [200, 'Full', 'The well is filled.'], [232, 'Seated', 'The block lowers into place.'], [259, 'Closed', 'A capstone line completes the structure.']]
  },
  {
    id: 'check', n: '06', title: 'Successful Transaction Update', tech: 'Lottie', file: 'check', aspect: '1/1',
    principles: ['Respond', 'Reassure'], where: 'Transaction sheet, after changing a category',
    problem: 'Saving a category is a small action. It needs a clear “done” without a celebration.',
    intention: 'An ember ring draws, an ink check follows, and the mark settles from 92% to full size. Then the bars behind the sheet move to show the consequence.',
    behavior: 'Ring trim 0 to 0.4s; check trim from 0.2 to 0.57s; scale settles over 0.6s.',
    trigger: 'The category is saved.',
    timing: '0.75s, plays once',
    easing: '--ease-settle',
    a11y: 'The heading “Moved to Groceries” and a polite live-region announcement carry the confirmation. Focus moves to Done.',
    impl: 'sheet.querySelector(\'keel-lottie[name=check]\').replay()',
    storyboard: [[0, 'Start', 'Nothing.'], [12, 'Ring', 'The ring is drawing.'], [24, 'Check', 'The check follows.'], [44, 'Done', 'At rest, full size.']]
  },
  {
    id: 'empty', n: '07', title: 'Empty Transaction State', tech: 'Lottie', file: 'empty', aspect: '480/280',
    principles: ['Reassure'], where: 'Spending: a category with no transactions (Travel)',
    problem: 'An empty list can read as “something’s missing” or “you did it wrong”.',
    intention: 'A porcelain platform rises onto a ground line and a small ember settles on it: ready, not missing. The copy says the same: nothing’s wrong.',
    behavior: 'Ground line draws, platform rises 18px into place, the ember lowers last and its contact shadow firms up.',
    trigger: 'Plays once when the empty state comes into view.',
    timing: '2.2s, plays once, holds',
    easing: '--ease-settle',
    a11y: 'role="img" with a description; the heading and sentence carry the meaning.',
    impl: '<keel-lottie name="empty" trigger="inview" poster="end"></keel-lottie>',
    storyboard: [[0, 'Empty', 'Nothing.'], [40, 'Platform', 'The platform rises into place.'], [80, 'Arriving', 'The ember lowers.'], [131, 'Ready', 'Resting, waiting for the first entry.']]
  },
  {
    id: 'goal-created', n: '08', title: 'Financial Goal Created', tech: 'Lottie', file: 'goal-created', aspect: '480/300',
    principles: ['Reassure', 'Settle'], where: 'New goal sheet, after “Set this goal”',
    problem: 'Creating a goal is a commitment. It deserves a moment, but not fireworks.',
    intention: 'Three blocks arrive from alternating sides and stack into a stepped structure; the ember cap lowers last. A goal is a foundation being laid.',
    behavior: 'Basalt base, slate middle, porcelain top, each 20 frames apart, alternating left and right. Ember cap from 1.3s.',
    trigger: 'The goal is created.',
    timing: '2.2s, plays once, holds',
    easing: '--ease-settle',
    a11y: 'The heading names the goal; a live-region announcement confirms it. Focus moves to the next action.',
    impl: 'sheet.querySelector(\'keel-lottie[name=goal-created]\').replay()',
    storyboard: [[0, 'Empty', 'Ground line only.'], [30, 'Base', 'The basalt base settles.'], [60, 'Middle', 'The slate block arrives from the left.'], [90, 'Top', 'The porcelain block from the right; the cap appears.'], [131, 'Set', 'The cap rests on top.']]
  },
  {
    id: 'week', n: '09', title: 'Weekly Financial Summary', tech: 'SVG + JS, data-bound', chart: 'week',
    principles: ['Reveal', 'Explain'], where: 'Spending: day by day; lifecycle email preview',
    problem: 'A week of spending is a sequence. Shown all at once it’s a block of numbers.',
    intention: 'Days rise in order, left to right, against a dashed line for a usual day. Today is the one ember bar.',
    behavior: 'Bar heights are exact; each rises from the baseline with a 60ms stagger.',
    trigger: 'Opening Spending.',
    timing: '0.52s per bar, 60ms stagger, about 0.9s total',
    easing: '--ease-settle',
    a11y: 'role="img" with a description listing every day’s total; the header gives the week total in text.',
    impl: 'KeelCharts.week(svg, { days, usual: 48, today })'
  },
  {
    id: 'upcoming', n: '10', title: 'Upcoming Expenses', tech: 'SVG + JS, data-bound', chart: 'timeline',
    principles: ['Reveal', 'Orient'], where: 'Steady screen: coming up',
    problem: 'A list of bills doesn’t show how close together they are, or which one is next.',
    intention: 'A timeline draws from today. Bills appear in order as quiet ink dots; payday is a post with an ember pennant; the next bill arrives last, larger, in ember, with its name.',
    behavior: 'Line draws (0.52s), marks fade and settle 4px with 60ms stagger, emphasis last.',
    trigger: 'Opening Steady; any bill or payday change.',
    timing: 'About 0.9s',
    easing: '--ease-settle',
    a11y: 'role="img" with a description listing every bill; the list below repeats it in full text with “Next” as a word.',
    impl: 'KeelCharts.timeline(svg, { today, payday, bills })'
  },
  {
    id: 'loading', n: '11', title: 'Loading', tech: 'Lottie', file: 'loading', aspect: '200/80', loop: true,
    principles: ['Respond', 'Reassure'], where: 'App boot if fonts take over 300ms; the case study’s prototype frame while it loads',
    problem: 'Waiting with no sign of life feels broken; a long decorative loader feels like the wait is the product.',
    intention: 'Three small blocks on a line drift a few pixels out of level and settle back, in turn. Quiet, short, and only while something is actually loading.',
    behavior: 'The loop has no visible join: each block lifts 7px and settles, 10 frames after the previous one.',
    trigger: 'Only while waiting. Never shown for a fake delay.',
    timing: '1.6s loop',
    easing: '--ease-lift up, --ease-settle down',
    a11y: 'Paired with visible text (“Loading Keel”). Reduced motion shows a still frame with the same text.',
    impl: '<keel-lottie name="loading" loop></keel-lottie>',
    storyboard: [[0, 'Level', 'All three at rest.'], [24, 'Lift', 'The first block rises.'], [40, 'Ember', 'The middle block rises.'], [60, 'Settle', 'The last block rises as the first lands.'], [95, 'Level', 'Back where it started: the loop point.']]
  },
  {
    id: 'scenario', n: '12', title: 'Financial Scenario Comparison', tech: 'SVG + JS, data-bound', chart: 'scenario',
    principles: ['Explain', 'Connect'], where: 'Plan screen',
    problem: '“Save $100 more each paycheck” is easy to say and hard to picture.',
    intention: 'Two step lines over six months: the current plan dashed, the change in ember. When the slider moves, the ember path moves to the new totals, so the consequence is visible as a shape.',
    behavior: 'Every step is a real paycheck date and a real total. The path interpolates point by point from the previous scenario to the new one.',
    trigger: 'Moving the slider; applying the plan.',
    timing: '0.52s',
    easing: '--ease-standard',
    a11y: 'A visually hidden table lists the same numbers; the readouts say the outcome in sentences; the range input is a native slider with a label.',
    impl: 'KeelCharts.scenario(svg, series, { from: previous })'
  },
  {
    id: 'onboarding', n: '13', title: 'Onboarding Transition', tech: 'Lottie', file: 'onboarding', aspect: '640/340', segments: [['Accounts', 0, 60], ['Bills', 60, 120], ['Payday', 120, 180], ['Ready', 180, 240]],
    principles: ['Connect', 'Orient'], where: 'Onboarding: accounts, bills, payday',
    problem: 'Three setup steps feel like three forms. The point is that each answer builds the same picture.',
    intention: 'One equilibrium object stays on screen across the steps and changes with each message: your money lands, the bills stack on, the shore extends to payday and the beam levels, and the ember settles when the reading is ready.',
    behavior: 'Four one-second segments with markers. Going back plays the previous segment in reverse, so the object undoes exactly what the step added.',
    trigger: 'Each step change.',
    timing: '1.0s per segment',
    easing: 'Swing as the beam tips, --ease-settle as things land',
    a11y: 'Decorative (aria-hidden): every step’s words carry the meaning. Reduced motion jumps to each segment’s end.',
    impl: 'onb.playSegment(from, to)  // from > to plays backwards',
    storyboard: [[59, 'Accounts', 'What you have: the basalt mass lands and the beam tips.'], [119, 'Bills', 'What’s spoken for: three bills stack on the right.'], [179, 'Payday', 'The shore: the ground extends to a payday post, the beam levels.'], [240, 'Ready', 'The ember settles on the pivot.']]
  },
  {
    id: 'signature', n: '14', title: 'Brand Signature', tech: 'Lottie', file: 'signature', aspect: '640/240',
    principles: ['Settle', 'Orient'], where: 'Case study, visual identity',
    problem: 'A static logo explains nothing about how the brand moves.',
    intention: 'A thin waterline draws across. The hull drops onto it, the keel extends below, and the wordmark rises into place letter by letter. The identity, assembled by its own logic.',
    behavior: 'The wordmark is the real Fraunces outline (extracted with fontTools, so no font loads inside the animation).',
    trigger: 'Plays once in view.',
    timing: '3.0s',
    easing: '--ease-settle',
    a11y: 'role="img" labeled “Keel”. Reduced motion shows the final lockup.',
    impl: '<keel-lottie name="signature" trigger="inview" poster="end" label="Keel"></keel-lottie>',
    storyboard: [[0, 'Empty', 'Nothing.'], [40, 'Line', 'The waterline draws; the hull drops.'], [80, 'Keel', 'The keel extends; letters begin.'], [110, 'Wordmark', 'Letters rise in turn.'], [179, 'Lockup', 'Complete.']]
  },
  {
    id: 'complete', n: '15', title: 'Completion', tech: 'Lottie', file: 'complete', aspect: '1/1',
    principles: ['Reassure', 'Settle'], where: 'Goals (money added) and Plan (plan applied)',
    problem: 'Confirmations get lost. A recognizable mark makes “that worked” instant.',
    intention: 'Two posts rise, a lintel lowers across them, and the ember keystone slides into place last. A small finished structure.',
    behavior: 'Posts scale up from the ground, lintel drops 26px, keystone slides 40px.',
    trigger: 'Money added to a goal; a plan applied.',
    timing: '1.4s, holds',
    easing: '--ease-settle',
    a11y: 'Always paired with a sentence in a live region (“Added $50. Steady through Oct 24.”).',
    impl: 'confirm.querySelector(\'keel-lottie[name=complete]\').replay()',
    storyboard: [[0, 'Ground', 'Nothing yet.'], [20, 'Posts', 'Two posts rise.'], [40, 'Lintel', 'The lintel lowers on.'], [60, 'Keystone', 'The ember slides in.'], [83, 'Done', 'At rest.']]
  },
  {
    id: 'keel-settle', n: '16', title: 'The Keel (from version 1)', tech: 'Lottie', file: 'keel-settle', aspect: '3/2',
    principles: ['Settle'], where: 'App welcome screen; case study illustration section',
    problem: 'The product’s name needs a picture: what does a keel actually do?',
    intention: 'A boat drawn as a cutaway so the keel shows below the waterline. It rocks and settles level: the hidden thing made visible.',
    behavior: 'Heels 9°, swings with decaying amplitude around the center of buoyancy, within half a degree of level by 3s and still by 3.7s, then holds.',
    trigger: 'Welcome screen opens; in view in the case study.',
    timing: '5.0s, plays once, holds',
    easing: 'Pendulum swing',
    a11y: 'role="img" with a description; reduced motion shows the level boat.',
    impl: '<keel-lottie name="keel-settle" poster="end"></keel-lottie>',
    storyboard: [[0, 'Heeled', '9° over.'], [44, 'Swing', 'Past level the other way.'], [120, 'Settling', 'Small swings.'], [180, 'Level', 'At rest.']]
  }
];
