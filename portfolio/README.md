# Keel: portfolio and LinkedIn kit

Everything needed to publish Keel: the portfolio thumbnail and copy, the LinkedIn post, the carousel, and talking points for interviews.

**Live links** (Vercel, rebuilt on every push to `main`):

- Case study: https://keel-casestudy.vercel.app
- Live demo (the prototype): https://keel-casestudy.vercel.app/prototype/
- Design system: https://keel-casestudy.vercel.app/design-system/

## Files

| File | Size | Use |
| --- | --- | --- |
| `keel-thumbnail-1600x1200.png` | 1600 × 1200 | Portfolio grid thumbnail (Wix) |
| `keel-og-1200x630.png` | 1200 × 630 | Link preview image (already wired into `index.html`) |
| `linkedin-carousel/keel-carousel.pdf` | 9 pages | Upload to LinkedIn as a document: it becomes a swipeable carousel |
| `linkedin-carousel/keel-carousel-01.png` to `-09.png` | 1080 × 1350 each | The same slides as PNGs, for other platforms or a multi-image post |
| `video/keel-showcase-1080x1350.mp4` | 4:5, 69.4s | **Main LinkedIn video:** the whole project in about a minute (brand animation, the problem, the prototype, the motion system, the design system, the links), captioned |
| `video/keel-showcase-cover.png` | 1080 × 1350 | Showcase video cover |
| `video/keel-prototype-demo-1080x1350.mp4` | 4:5, 45.4s | Shorter video: the prototype alone in a phone frame, captioned |
| `video/keel-prototype-demo-cover.png` | 1080 × 1350 | Prototype video cover |
| `source/` | | Editable HTML for every image and the video pipeline. Re-export images with `node portfolio/source/export.mjs` |

Every number on the slides is either a cited published figure (APA 2015; Karlsson, Loewenstein and Seppi 2009) or a measurement from `docs/motion-system/qa-report.md`. The app screens are live captures of the prototype.

## Portfolio (Wix)

**Cover image:** `keel-thumbnail-1600x1200.png`. For a video slot on the project page, use `video/keel-showcase-1080x1350.mp4`.

**Title:** Keel: A Calm Fintech App, UX and Visual Design Case Study

**Subtitle (if the layout has one):** Designing a money app for the bad weeks

**Description:** Keel is a fintech concept that answers one question before anything else: how long are you covered? Instead of red overages, the home screen shows one date, drawn as a keel under a waterline that means payday. The project covers desk research on money stress and the ostrich effect, information architecture, wireframes, the Harbor & Signal identity and design system (94 contrast pairings, 0 failing), a motion system of 12 Lottie and 4 Rive animations written in code, and a working React prototype with real calculations. Fictional brand, self-directed project; no user testing yet, and the case study says so.

**Shorter description (if the field is limited):** A calm fintech concept: one date instead of a balance, spending shown in days, and a working prototype.

**Details:** Role: UX and visual design, motion design, front-end prototype. Built with React, Vite, Lottie and Rive. Type: Switzer. 2026.

**Buttons** (label, then link):
- Read the case study: https://keel-casestudy.vercel.app
- Try the live demo: https://keel-casestudy.vercel.app/prototype/
- Explore the design system: https://keel-casestudy.vercel.app/design-system/

## LinkedIn post

Assets: `linkedin-carousel/keel-carousel.pdf` (document post). Post length: about 1,070 characters. Put the links in the first comment.

```
Most budgeting apps are built for the weeks you don't need them.

On a rough week, they meet you with red.

Behavioral research has a name for what happens next: the ostrich effect. People check their finances less when the news is bad. And the APA found 72% of adults feel money stress at least some of the time. So a red overage isn't feedback. It's a reason to close the app.

Keel is a self-directed case study that flips the headline. The home screen doesn't lead with a balance. It leads with one date, "steady through Oct 25", drawn as a keel under a waterline that always means payday. Deeper keel, more days of room.

Everything else follows from that one decision: spending shown in days instead of overages, a purchase check before you buy, motion that settles instead of startles.

Inside: research review, IA, wireframes, identity, a motion system (Lottie and Rive, written in code) and a working prototype. No user testing yet, and the case study says so.

Should a money app ever show you red?

#UXDesign #VisualDesign #ProductDesign #MotionDesign #Fintech
```

**First comment:**

```
Case study: https://keel-casestudy.vercel.app
Live demo: https://keel-casestudy.vercel.app/prototype/
Design system: https://keel-casestudy.vercel.app/design-system/
```

**Document title** (LinkedIn asks for one when you upload the PDF): Keel: designing a money app for the bad weeks

### Why this should travel

- **The hook is contrarian, and the slides back it with a source.** "Built for the weeks you don't need them" invites disagreement, and the ostrich-effect citation keeps it from reading as a hot take.
- **A carousel keeps people on the post.** Each swipe is an interaction, so the 9 slides each end on a reason to see the next.
- **The closing question has two real sides.** "Should a money app ever show you red?" gets designers arguing in the comments, and comments are what extend reach.
- **Links go in the first comment**, so the post isn't treated as an outbound link. The tags in `index.html` still give the link a proper preview card.

### Posting checklist

1. The site is live on Vercel. Paste the case study URL into LinkedIn Post Inspector (linkedin.com/post-inspector) to check that the preview card shows `keel-og-1200x630.png`.
2. Start a post, choose **Add a document**, upload `keel-carousel.pdf` and give it the document title above.
3. Paste the post text and publish.
4. Post the first comment with all three links straight away.
5. Reply to early comments in the first hour; that's when engagement counts most for reach.

## LinkedIn video post: the whole project in a minute (main post)

Assets: `video/keel-showcase-1080x1350.mp4` (4:5, 69.4s, H.264, 30fps, 14.3 MB, no audio) and `video/keel-showcase-cover.png`. Captions are on screen, so it reads with the sound off. Six parts: the brand animation and the hook, the problem (APA, cited on screen), the prototype walkthrough, the motion system (real Lottie files), the design system (palette, Switzer, glass buttons, contrast) and the three links.

Post length: about 1,080 characters. Put the links in the first comment.

```
Most money apps are built like smoke alarms.
Loud, red, and only useful once something is already burning.

72% of U.S. adults say they feel stressed about money at least some of the time (APA). Behavioral research has a name for what happens next: the ostrich effect. When the news looks bad, people check their finances less. Red numbers don't change behavior. They change who opens the app.

Keel is a fintech concept designed for the bad week. The home screen answers one question first: how long are you covered? One date, drawn as a keel under a waterline that always means payday. A $16.80 lunch reads as "about a third of a day," not an overage, and a purchase gets checked before it happens.

The video walks the whole build in about a minute:
→ a working prototype on sample data
→ 12 Lottie and 4 Rive animations, written in code
→ a design system with 94 contrast pairings, 0 failing

Case study, live demo and design system are linked in the comments.

What would make you open a money app on a bad week?

#ProductDesign #UXDesign #Fintech #MotionDesign #DesignSystems
```

**First comment:**

```
Case study: https://keel-casestudy.vercel.app
Live demo: https://keel-casestudy.vercel.app/prototype/
Design system: https://keel-casestudy.vercel.app/design-system/
```

**Alt text:** "A one-minute video about Keel, a fintech app concept. The Keel logo animates in, then a statistic: 72% of U.S. adults feel stressed about money. The working prototype plays in a phone frame: a first reading of steady through Oct 25, a purchase check, spending in days, adding to a goal and comparing a plan. Then four of the project's animations, the design system's palette, typeface and buttons, and links to the case study, live demo and design system."

### Why this should travel

- **The hook is contrarian and visual.** "Built like smoke alarms" is a picture people can argue with, and the second line pays it off.
- **One strong stat, cited.** The APA figure and the ostrich effect carry the argument; the rest is the product.
- **The video holds attention without sound.** Every scene has a caption, and something new appears every few seconds.
- **The arrows make the build scannable**: prototype, motion, design system, three proofs in three lines.
- **Links in the first comment** keep the post from being treated as outbound; the closing question gives people a reason to comment.

### Posting checklist

1. Upload `keel-showcase-1080x1350.mp4` natively, not as a link, so it autoplays in the feed.
2. Set `keel-showcase-cover.png` as the thumbnail if LinkedIn offers it, and paste the alt text.
3. Paste the post and publish; add the first comment with all three links straight away.
4. Reply to early comments in the first hour.
5. Space it from the carousel post by a few days: the carousel tells the argument, the video shows the work.

## LinkedIn video post: the prototype in motion (shorter alternative)

Assets: `video/keel-prototype-demo-1080x1350.mp4` (4:5, 45.4s, H.264, 30fps, 9.8 MB, no audio) and `video/keel-prototype-demo-cover.png` (the opening frame, for a custom thumbnail). Every frame is the working prototype recorded in a browser and placed in a phone frame, with on-screen captions so it reads with the sound off. Six scenes: setup, the reading, the purchase check, spending in days, adding to a goal, and comparing a plan, then an end card.

Post length: about 905 characters. Put the links in the first comment.

```
Most money apps are designed like smoke alarms.
Loud, red, and only useful once something is already burning.

Behavioral research has a name for how people respond: the ostrich effect. When the news looks bad, people check their finances less, not more. Keel is a concept that designs for that moment instead of against it.

The home screen answers one question first: how long are you covered? Steady through Oct 25, drawn as a keel under a waterline that always means payday. Check a purchase and the keel moves before you spend. A $16.80 lunch reads as "about a third of a day," not an overage. Plans get compared side by side before anything changes.

Every frame in this video is the working prototype, running on sample data. Case study and prototype links are in the comments.

What would make you open a money app on a bad week?

#ProductDesign #UXDesign #InteractionDesign #Fintech #MotionDesign
```

**First comment:**

```
Case study: https://keel-casestudy.vercel.app
Live demo: https://keel-casestudy.vercel.app/prototype/
Design system: https://keel-casestudy.vercel.app/design-system/
```

**Posting checklist**

1. Upload the MP4 natively (not a link), so it autoplays in the feed.
2. Add alt text: "Screen recording of the Keel prototype in a phone frame: a first reading of steady through Oct 25, a $250 purchase check moving the keel, spending shown in days, adding $100 to a goal, and a plan comparison chart. Captions explain each step."
3. Choose the cover image if LinkedIn offers a thumbnail option.
4. Post the first comment with all three links, and reply to early comments in the first hour.

Post the carousel and the video a few days apart: the carousel tells the argument, the video shows the product.

To re-record after the app changes: serve the built site on port 4319 and run `portfolio/source/video/record.mjs`. Then serve a folder holding `compose.html`, `showcase.html`, the `rec/` recording, `mp4-muxer` (installed next to them), `assets/vendor/lottie.min.js` and `assets/lottie/*.json` (as `lottie/`) on port 4320, and run `node encode.mjs demo.mp4 compose.html` and `node encode.mjs showcase.mp4 showcase.html`. They need Chrome; no ffmpeg.

## Talking points: how to explain Keel

**One sentence.** Keel is a budgeting app concept that replaces "what did you spend?" with "how long are you covered?", because research shows people look away from their finances exactly when things get hard.

**The problem.** Most budgeting apps are built around limits: category ceilings, red overages, alerts. That assumes people lack information. But the APA's *Stress in America* survey (2015) found 72% of adults feel money stress at least some of the time, and the ostrich effect (Karlsson, Loewenstein and Seppi, 2009; Sicherman et al., 2016) shows people check their finances less when the news is bad. So red numbers teach people to stop opening the app on the weeks they need it most.

**The question.** How might we give someone one calm, honest answer about whether they're okay, one they'd still open on a bad week?

**The solution.**
1. **One answer first.** The home screen shows a date: "You're steady through Oct 25." Keel walks forward from today, subtracts usual daily spending and bills, and leaves out future income on purpose.
2. **The keel.** The waterline is payday and the keel's depth is days of room past it. One visual, one meaning, on every screen.
3. **Weight, not walls.** No red overages and no category limits. A $16.80 lunch is "about a third of a day of your usual spending." A purchase check shows the effect before you spend.
4. **Settle, don't startle.** The keel eases to its new depth in about 900ms. No shakes, flashes or confetti.

**What I made.** A long-form case study (problem, research, IA, wireframes, identity, motion, testing plan, reflection); a working prototype on mobile and desktop with light and dark themes and reduced motion; the Harbor and Signal color system; and a motion system of 12 Lottie animations and 4 Rive state machines, all written in code. It also has accessibility QA, automated with `npm test`: 0 contrast failures across 25,646 text measurements, focus kept inside dialogs, no sideways scrolling at 320px, and 61fps with the CPU slowed 4×.

**Be upfront about limits.** No interviews and no usability tests: the research is a literature and competitor review, and the tests are a written plan with proposed measures. If asked, say it plainly. It shows judgment, not a gap.

**A good answer to "what would you do next?"** Run the five-second test on the home screen, pressure-test "usual daily spending" for people with irregular income, and design the bad day properly: a real path when you're short before payday.
