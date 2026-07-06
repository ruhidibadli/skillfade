---
title: "Streaks Measure Attendance, Not Skill"
description: "A green streak proves you showed up, not that you still know anything. Why engagement metrics hide skill decay — and what to measure instead."
date: "2026-07-07"
tags: ["streaks", "retention", "skill decay", "learning"]
draft: false
---

I kept a 140-day streak on a language-learning app. At the end of it, I could
not hold a basic conversation.

The streak was not lying about effort. I really did open the app 140 days in a
row. It was lying about the thing I actually cared about: whether the skill was
getting better, holding steady, or quietly rotting. The number went up. The
skill did not.

That gap — between *engagement* and *retention* — is what I want to talk about.
And I want to be fair to streaks, because the lazy version of this argument is a
strawman.

## Streaks are good at exactly one thing

Streaks, XP, badges, and levels are not stupid. They are well-engineered
solutions to a real problem: **getting you to come back.** Habit formation is
hard, and a visible chain you don't want to break is a genuinely effective
nudge. For the first few weeks of a new habit, gamification can be the
scaffolding that gets you over the hump.

So let me be clear about what I'm *not* claiming. I'm not claiming streaks are
useless or that everyone who likes them is being fooled. They solve the
consistency problem, and consistency is real.

The problem is what happens *after* you've shown up. The instrument that got you
in the door starts optimizing for the wrong thing.

## What the streak is actually measuring

A streak measures one binary per day: *did you do the minimum action?* That's
it. It is a proxy, and like all proxies, it drifts from the real target the
moment you start optimizing for the proxy itself.

Once a streak has value to you, the rational move is to protect it as cheaply as
possible. One flashcard at 11:58pm. The easiest lesson. The five-minute "review"
that re-touches things you already know. The streak stays green. And none of it
answers the one question that matters: **am I actually getting better, or just
keeping a record of attendance?**

Worse, the green number *feels* like progress, so it suppresses the signal that
should be alarming you. A 140-day streak hides skill decay because the dashboard
is bright green — loud and reassuring in exactly the situation where you most
need it to be quiet and honest.

This isn't unique to language apps. We have decent instruments for almost
everything else in our working lives. Test coverage tells you how exposed your
code is. Your IDE underlines the bug. `git blame` tells you who to ask. CI tells
you the moment something breaks. For the state of our *code*, we have gauges
everywhere.

For the state of our *skills* — the actual asset we rent out for a salary — we
have nothing. No needle dropping into the red. You discover the decay the day
you open a repo in a language you "used to know," and the feedback arrives months
late, disguised as a personal shortcoming.

## A calmer instrument: a mirror

So here's the alternative I keep coming back to. Instead of an instrument that
nags and rewards and manufactures dopamine, what if you had one that just **told
you the truth and then shut up?**

Not "great job, 7-day streak!" Not a red exclamation badge. Just: *this skill was
last practiced 19 days ago, its freshness is 68%, and you've read four articles
about it without writing a line of code.* No judgment. No confetti.

A streak counter punishes you for a sick day and bribes you with a number that
has nothing to do with whether you can still write the code. I didn't want a
slot machine. I wanted a bathroom scale — a flat, honest reading you can choose
to act on or ignore. A mirror, not a coach.

To build a mirror like that, you have to model the thing streaks refuse to
model: **decay.** That part is surprisingly little code — I walk through it in
[Modeling Skill Decay in ~40 Lines of Python](/blog/modeling-skill-decay-in-python).

## The honest takeaway

Your streak is a measure of attendance. That's worth something — showing up is
the prerequisite for everything else. But don't confuse it with skill, and don't
let a wall of green numbers reassure you out of noticing that something you used
to be good at is slipping.

The reframe that actually changed how I work was small but total: **stop
measuring what you've learned, start measuring what you've produced.** You close
the tab and go build the small ugly thing instead. The screen is blank for a
minute — and the blank screen is where retention is actually made.

I wanted a tool that worked this way, so I built [SkillFade](https://skillfade.website):
a mirror, not a coach. It tracks skill freshness, flags theory-heavy skills and
practice droughts, and never once shows you a streak. The useful question was
never *"how many days in a row?"* It was *"when did I last actually do this, and
how much of it is still in my hands?"*
