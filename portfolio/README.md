# Keel: portfolio and LinkedIn kit

Everything needed to publish Keel: the portfolio thumbnail and copy, the LinkedIn post, the carousel, and talking points for interviews.

**URLs used below.** They assume the Netlify site is named `keel-casestudy`. If you pick a different name, replace the domain here and in the `og:` tags at the top of `index.html`.

- Case study: https://keel-casestudy.netlify.app
- Prototype (demo): https://keel-casestudy.netlify.app/prototype/

## Files

| File | Size | Use |
| --- | --- | --- |
| `keel-thumbnail-1600x1200.png` | 1600 × 1200 | Portfolio grid thumbnail (Wix) |
| `keel-og-1200x630.png` | 1200 × 630 | Link preview image (already wired into `index.html`) |
| `linkedin-carousel/keel-carousel.pdf` | 9 pages | Upload to LinkedIn as a document: it becomes a swipeable carousel |
| `linkedin-carousel/keel-carousel-01.png` to `-09.png` | 1080 × 1350 each | The same slides as PNGs, for other platforms or a multi-image post |
| `video/keel-prototype-demo-1080x1350.mp4` | 4:5, 45.4s | LinkedIn video: the prototype in a phone frame, captioned |
| `video/keel-prototype-demo-cover.png` | 1080 × 1350 | Video cover |
| `source/` | | Editable HTML for every image and the video pipeline. Re-export images with `node portfolio/source/export.mjs` |

Every number on the slides is either a cited published figure (APA 2015; Karlsson, Loewenstein and Seppi 2009) or a measurement from `docs/motion-system/qa-report.md`. The app screens are live captures of the prototype.

## Portfolio (Wix)

**Title:** Keel: A Calm Money App, UX and Visual Design Case Study

**Description:** A budgeting app concept that tells you you’re okay before anything else. Desk research on money stress and the ostrich effect, IA, wireframes, a Harbor and Signal identity, a motion system of Lottie and Rive files written in code, and a working prototype with real calculations. Fictional brand, self-directed project.

**Shorter description (if the field is limited):** A calm money app concept: one date instead of a balance, spending shown in days, and a working prototype.

**Links:**
- Case study: https://keel-casestudy.netlify.app
- Try the prototype: https://keel-casestudy.netlify.app/prototype/

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
Case study: https://keel-casestudy.netlify.app
Try the prototype: https://keel-casestudy.netlify.app/prototype/
```

**Document title** (LinkedIn asks for one when you upload the PDF): Keel: designing a money app for the bad weeks

### Why this should travel

- **The hook is contrarian, and the slides back it with a source.** "Built for the weeks you don't need them" invites disagreement, and the ostrich-effect citation keeps it from reading as a hot take.
- **A carousel keeps people on the post.** Each swipe is an interaction, so the 9 slides each end on a reason to see the next.
- **The closing question has two real sides.** "Should a money app ever show you red?" gets designers arguing in the comments, and comments are what extend reach.
- **Links go in the first comment**, so the post isn't treated as an outbound link. The tags in `index.html` still give the link a proper preview card.

### Posting checklist

1. Deploy to Netlify first, then paste the case study URL into LinkedIn Post Inspector (linkedin.com/post-inspector) to check that the preview card shows `keel-og-1200x630.png`.
2. Start a post, choose **Add a document**, upload `keel-carousel.pdf` and give it the document title above.
3. Paste the post text and publish.
4. Post the first comment with both links straight away.
5. Reply to early comments in the first hour; that's when engagement counts most for reach.

## LinkedIn video post: the prototype in motion

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
Case study: https://keel-casestudy.netlify.app
Try the prototype: https://keel-casestudy.netlify.app/prototype/
```

**Posting checklist**

1. Upload the MP4 natively (not a link), so it autoplays in the feed.
2. Add alt text: "Screen recording of the Keel prototype in a phone frame: a first reading of steady through Oct 25, a $250 purchase check moving the keel, spending shown in days, adding $100 to a goal, and a plan comparison chart. Captions explain each step."
3. Choose the cover image if LinkedIn offers a thumbnail option.
4. Post the first comment with both links, and reply to early comments in the first hour.

Post the carousel and the video a few days apart: the carousel tells the argument, the video shows the product.

To re-record after the app changes: serve the built site on port 4319, then run `portfolio/source/video/record.mjs`, `compose.html` (with `mp4-muxer` installed next to it) and `encode.mjs`. They need Chrome; no ffmpeg.

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
