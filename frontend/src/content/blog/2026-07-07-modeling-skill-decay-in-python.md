---
title: "Modeling Skill Decay in ~40 Lines of Python"
description: "The forgetting curve isn't a metaphor. Here's how to model skill decay as data — input vs output, decay from last practice, and a small Python function."
date: "2026-07-07"
tags: ["python", "skill decay", "forgetting curve", "spaced repetition"]
draft: false
---

A green streak proves you showed up, not that you still know anything — I made
that case in [Streaks Measure Attendance, Not Skill](/blog/streaks-measure-attendance-not-skill).
This post is the other half: if a streak is the wrong instrument, what's the
right one? It turns out you can model skill decay honestly in about forty lines
of Python.

## The forgetting curve is not a metaphor

In the 1880s, Hermann Ebbinghaus spent years memorizing nonsense syllables and
measuring how fast he lost them. The result was the **forgetting curve**:
retention drops sharply soon after learning, then levels off. You don't forget
linearly. You lose a lot fast, and the remainder fades slowly.

The shape is roughly exponential — and that detail is the whole reason the model
below works. Ebbinghaus also found the antidote, and it isn't "try harder." Two
effects do the heavy lifting: the **spacing effect** (reviews at intervals beat
cramming) and **retrieval practice** (recalling something from memory strengthens
it far more than re-reading it). Recognition is cheap. Reconstruction is what
sticks.

## Modeling skill decay as data

Most tracking tools log one undifferentiated event: "studied today." That's the
streak data model, and it's too poor to ever show decay. To do better, you need
two ideas.

### 1. Input is not output

Split every event into one of two kinds:

- **Learning events (INPUT):** reading, watching a video, a course, skimming
  docs, following a tutorial. Consuming.
- **Practice events (OUTPUT):** doing an exercise, building a project, shipping
  work, teaching someone, writing about it. Producing.

This distinction is the whole game. I can spend six hours watching React talks
and end the week *less* able to build a React app than someone who spent one hour
building one, because I confused familiarity with ability. Any model that scores
those two activities equally will lie to you the same way a streak does.

```python
class EventType(str, Enum):
    LEARNING = "learning"   # input:  read, watch, course, article, docs
    PRACTICE = "practice"   # output: exercise, project, work, teach, build
```

Two columns, not one. Collapse them now and you can never reconstruct the
distinction later — and the distinction is the point.

### 2. Anchor decay to your last *practice*, not your last *touch*

A skill fades when you stop *using* it, not when you stop reading about it. So the
clock that matters is days since your last **practice** event:

```python
def days_since_last_practice(events, now):
    practices = [e for e in events if e.type == EventType.PRACTICE]
    if not practices:
        return (now - skill_started_at(events)).days  # never practiced → decaying from day one
    last = max(p.occurred_at for p in practices)
    return (now - last).days
```

Note the edge case in the comment. A skill you *learned* but never *practiced*
doesn't sit at 100 — it starts decaying from the day you began tracking it. The
tutorial you watched in January and never applied is not a skill you have. It's a
skill you met once.

### 3. Decay exponentially, then let learning slow the bleed

Following Ebbinghaus, decay is exponential — multiply remaining freshness by a
constant just under 1 each idle day. Then add a *small, capped* boost for recent
learning: enough to mean "I refreshed the theory," never enough to fake mastery
you haven't earned.

```python
def freshness(days_since_practice, learning_events_30d, decay_rate=0.98):
    # 1. Start from full mastery.
    score = 100.0

    # 2. Exponential decay anchored to the LAST PRACTICE.
    #    ~2%/day by default; tune decay_rate per skill.
    score *= decay_rate ** days_since_practice

    # 3. Small, capped learning boost. Reading slows the bleed;
    #    it does not restore what doing would. +2% each, max +15%.
    boost = min(learning_events_30d * 2, 15)
    score += boost

    # 4. Keep it honest: clamp to 0–100.
    return max(0.0, min(100.0, score))
```

At ~2% loss per idle day, the behavior feels right:

- **1 week unused → ~87%.** A little dusty.
- **1 month → ~55%.** You'd need to warm up.
- **3 months → ~16%.** Functionally, you'd be relearning.

A few things worth noticing in that formula:

- **It can go down even when you're "active."** If all your recent events are
  learning events, `days_since_practice` keeps climbing and the score keeps
  falling, capped boost notwithstanding. A streak would be green; this would be
  dropping. That divergence is the entire point.
- **The decay rate is per-skill.** Your spoken French rots faster than your
  touch-typing. A muscle-memory skill might use `0.995`; something fragile and
  conceptual might use `0.95`. One global constant would be its own little lie.
- **The boost is capped on purpose.** Without it, you could grind fifty articles
  in a weekend and "max out" a skill you've never once applied.
- **The clamp isn't ceremony.** Exponential decay also means it never quite hits
  zero — which is honest. You never *fully* forget how to ride the bike; you just
  get slow and wobbly.

### Three truths the model can now surface

Once your data separates input from output and decays from last practice, a few
honest signals fall out almost for free:

1. **Learning decay** — skills degrade without reinforcement. The freshness
   number *is* this.
2. **Practice scarcity** — learned-but-never-practiced skills, anything with no
   practice in 21+ days, or a "theory-heavy" flag when your learning:practice
   ratio climbs past 5:1.
3. **Input/output imbalance** — a simple `balance = practice_count / learning_count`.
   Above 1.0 means you produce more than you consume, which is where retention
   actually lives.

None of this needs AI or a recommendation engine. It's arithmetic over two
columns and a date. The hard part was never the math — it was deciding to write
the events down and being honest about which kind each one was.

## I built the mirror version

I wanted this for myself, so I built it: **[SkillFade](https://skillfade.website)**
— a small side project whose tagline is "a mirror, not a coach." You log learning
and practice events per skill; it computes the freshness score above, flags
theory-heavy skills and practice droughts, and overlays hours-invested against
freshness so you can see when you've poured time into something that's decaying
anyway.

What it deliberately does *not* have: points, badges, streaks, levels, or AI
telling you what to do next. The moment you add a streak, the goal quietly
changes from "be honest about my skills" to "don't break the streak." The model
is maybe forty lines of Python and it stands on its own whether you use my thing
or write twenty lines in a notebook.

The useful question was never *"how many days in a row?"* It was *"when did I last
actually do this, and how much of it is still in my hands?"* That question doesn't
fit on a badge. That's exactly why it's worth tracking.
