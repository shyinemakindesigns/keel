// Generates docs/motion-system/animation-specifications.md from assets/js/motion-registry.js,
// so the written specs can never drift from what the gallery shows.
//   node source/lottie/gen_specs.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
global.window = {};
require(path.join(root, 'assets/js/motion-registry.js'));
const M = window.KEEL_MOTION;
const kb = f => { try { return (fs.statSync(path.join(root, f)).size / 1024).toFixed(1) + ' KB'; } catch (e) { return 'n/a'; } };
let md = `# Animation specifications

Generated from \`assets/js/motion-registry.js\` by \`node source/lottie/gen_specs.js\`. Do not edit by hand.

Every animation is labeled by what it actually is:

- **Lottie**: hand-authored Lottie JSON, built by \`source/lottie/build.py\` (light and dark files, identical keyframes).
- **Lottie, progress-mapped**: a Lottie whose timeline is linear in one value; the app eases to the frame that equals real state.
- **SVG + JS, data-bound**: drawn from data by \`assets/js/keel-charts.js\`, because a keyframed file can't hold exact values.

Rive: Keel’s four state machines are specified, not authored; one CC BY community toggle runs in the Rive runtime on the case study. See [rive-spec.md](rive-spec.md).

| # | Animation | Technology | Trigger | Timing | Loop | Files |
| --- | --- | --- | --- | --- | --- | --- |
`;
M.forEach(m => {
  const files = m.file ? `\`${m.file}.json\` (${kb('assets/lottie/' + m.file + '.json')}), dark ${kb('assets/lottie/' + m.file + '-dark.json')}, fallback \`${m.file}.svg\`` : '`keel-charts.js`';
  md += `| ${m.n} | ${m.title} | ${m.tech} | ${m.trigger} | ${m.timing} | ${m.loop ? 'Yes, only while loading' : 'No'} | ${files} |\n`;
});
M.forEach(m => {
  md += `\n## ${m.n} · ${m.title}\n\n**${m.tech}** · Principles: ${m.principles.join(', ')} · Where: ${m.where}\n\n`;
  md += `- **Problem.** ${m.problem}\n- **Design intention.** ${m.intention}\n- **Motion behavior.** ${m.behavior}\n- **Trigger.** ${m.trigger}\n- **Timing.** ${m.timing}\n- **Easing.** ${m.easing}\n- **Accessibility.** ${m.a11y}\n- **Implementation.** \`${m.impl}\`\n`;
  if (m.segments) md += `- **Segments.** ${m.segments.map(s => `${s[0]} ${s[1]} to ${s[2]}`).join(', ')}\n`;
  if (m.storyboard) {
    md += `\n### Storyboard\n\nFrames of the shipped file, rendered headless (light theme).\n\n![${m.title} storyboard](storyboards/${m.file}.webp)\n\n| Frame | State | What happens |\n| --- | --- | --- |\n`;
    m.storyboard.forEach(f => { md += `| ${f[0]} | ${f[1]} | ${f[2]} |\n`; });
    md += `\nInitial state: frame ${m.storyboard[0][0]}. Final state: frame ${m.storyboard[m.storyboard.length - 1][0]}. User benefit: ${m.intention}\n`;
  }
});
fs.writeFileSync(path.join(root, 'docs/motion-system/animation-specifications.md'), md);
console.log('wrote animation-specifications.md', M.length, 'animations');
