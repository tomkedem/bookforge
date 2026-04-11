# Chapter 2: Reading Code Written by Humans and by Agents

In the previous chapter, we discussed writing code with the help of an Agent. Now we will focus on an equally important skill: critical code reading, identifying the decisions embedded in it, and understanding their engineering cost.

Reading code is not just understanding syntax. It is an attempt to uncover the decisions embedded in it. When we read code written by a human or an Agent, we're not just asking if it works, but what problem the writer tried to solve, what assumptions were embedded in the implementation, and what is the future cost of the choices made along the way.

As code writing becomes faster, cheaper, and more accessible, the value of engineering judgment increases. An Agent can produce clean, organized, and readable code, and still introduce weak design decisions, mixed responsibilities, or naive handling of failure states into the system. Therefore, the purpose of this chapter is not just to read lines of code, but to read intentions, assumptions, trade-offs, and risks.

**In this chapter, we will learn to read code in four layers:**

- What it does

- What problem it tries to solve

- What assumptions are embedded in it

- What is the engineering cost that results from it

## How to Understand from Code What Problem They Tried to Solve

After we've checked what the code actually does, the next question is what problem the writer tried to solve. This is no longer just reading lines, but an attempt to understand the diagnosis behind them.

Code is not a neutral sequence of commands. It reflects the way the person who wrote it understood the problem at that moment. Therefore, when we read existing code, the first task is not just to understand how it works, but to identify how the problem was defined. Did the writer try to solve a local symptom, or address a broader cause within the system.

This distinction is especially important when working with AI agents. Suppose the Lomda application starts responding slowly under load. If we ask the Agent to "fix the slowness," it might return a Pull Request with changes in dozens of files. At first glance, the code might look organized, consistent, and even convincing. In each component, a small adjustment was added, in each screen a local Cache was inserted, and at each point a specific improvement was made.

But this is exactly where critical reading is required. It's not enough to see that the code "improved something." You need to ask what problem was diagnosed here. If the same pattern repeats again and again in many places, the writer may not have identified a single central cause, but treated local symptoms. In such a case, the solution is not evidence of deep understanding of the system, but evidence that the problem was interpreted as a collection of separate slowdowns.

An experienced programmer will immediately check if the source of the problem is actually in a more central place, such as an inefficient query in the data layer, an incorrect loading structure, or a problematic responsibility boundary between components. If that's the case, a fix spread across dozens of files is not a systemic solution. It only hides the fact that the real problem was never addressed.

Therefore, when you read code, first look for the diagnosis embedded in it. Repetition is an important sign. If the same fix appears again and again with slight variations, the writer likely solved where the pain was felt, but not the cause that created it. On the other hand, when the solution is concentrated in one point, or a small number of points with a clear role, there is a higher chance that the problem was understood at a systemic level.

In other words, the question is not just what was fixed, but how the problem was defined. Correct code reading begins with identifying the diagnosis that generated it.

When you try to understand what problem the code solves, ask three questions:

- Is the solution concentrated or distributed

- Does it address the cause or the symptom

- Does it change the system structure or just add local fixes

## How to Identify Design Decisions in Code That Looks Simple

After we understood what problem the code tries to solve and what decisions were embedded in it, we need to ask an additional question: Is this solution really right for our system.

Here it's important to distinguish between two very different things: readable code and a correct solution.

Readable code is code that's easy to follow. Variable names are clear, structure is organized, and flow seems logical.

But a correct solution is measured differently. It is examined not only by its form, but by its fit to the reality in which the system operates: data structure, synchronization requirements, responsibility boundaries, failure states, and maintenance cost over time.

This is exactly where it's easy to make mistakes when working with AI agents. An Agent tends to produce code that looks very good at first glance. It adheres to structure, names, syntactic separation, and sometimes also to use of accepted patterns from familiar libraries and frameworks. But syntactic or stylistic fit is not a guarantee that the solution fits the system before us.

Let's return to the Lomda example. Suppose the Agent added a local Cache mechanism in each of the interface components, and in each file the code looks organized and clean. You can even see local improvement in screen response. But if the data in the system is supposed to be consistent in real time, distribution of local Cache mechanisms across many components creates a source of inconsistency. Each component may hold a slightly different picture of the actual state.

In such a case, the problem is not in the code's readability. On the contrary. Precisely its readability may lull criticism to sleep. The code looks good, and therefore it's easy to approve it too quickly. But in deeper engineering reading, it becomes clear that the solution is not correct, because it damages system consistency and distributes responsibility instead of concentrating it.

Therefore, when you read code that looks clean and convincing, don't just ask if it's understandable. Ask if it fits. Does it preserve the important constraints of the system. Does it prevent data duplication. Does it consider failure states. Is it correct only for the example in front of your eyes, or also for the broader reality in which the system will operate.

Readability is an important trait, but it's not the ultimate measure. Good code needs to be both readable and correct. When these two things conflict, engineering correctness takes precedence over local aesthetics.

**When code looks too good, that's not a sign to approve it faster. Sometimes it's precisely a sign to stop and examine it more deeply.**

## How to Identify Typical Risk Points in Code Written by an Agent

After we examined what the code does, what problem it tries to solve, what assumptions were embedded in it, and whether the solution actually fits the system, we can move to the next stage: focused scanning of typical risk points.

It's important to be precise: the Agent doesn't invent a new type of weak code. Humans also write code that deals well only with a state where everything works as expected, mixes responsibilities, or relies on untested assumptions. The difference is that the Agent is capable of producing such code at high speed, in broad scope, and in a form that looks clean and convincing.

Therefore, when reading code created with the help of an Agent, it's worth performing a systematic scan of several risk points that recur again and again.

**The first risk point is focusing only on the state where everything works as expected.**

Agents tend to succeed mainly in the case where everything works as we expected. They write the main logic, but don't always check what happens when data is missing, an external service doesn't respond, input is invalid, or the system state is slightly different from the example they were based on. Therefore, one of the first questions to ask is: what will happen here when everything doesn't go according to plan.

**The second is mixing responsibilities.**

The Agent will often choose the shortest path to complete a task. If it's required to change the UI, it may add data fetching, validation, or business calculation in the same place. The result sometimes looks efficient in the short term, but in practice it blurs the boundaries between system layers. Therefore, it's important to check not only if the code works, but also if the responsibility was placed in the right place.

**The third risk point is lack of isolation.**

Good code should be understandable and testable even outside the broad context in which it was written. When new code relies on global state, external variables, or indirect dependency on another component, it becomes more fragile and harder to test. Agents often use such shortcuts to make code work quickly, so it's important to ask: can this component be understood, run, and tested without relying on the rest of the system.

**The fourth is implicit assumptions.**

This is one of the quietest risks. Sometimes the Agent assumes that the data structure is uniform across the entire system, that all calls will return the same structure, or that every component consumes the same fields. These assumptions are not written explicitly, so they're also hard to identify at first glance. The way to expose them is to ask: what must be true for this code to work, and is that thing actually guaranteed in our system.

Instead of just asking "does this work," it's better to ask four fixed scanning questions:

What happens here when things don't go as expected

Is the responsibility in the right place

Is the code testable and understandable without relying on the rest of the system

What implicit assumptions must be true for it to work

These are not just questions for code written by an Agent. These are engineering reading questions in general. But when code is created quickly and relatively easily, and in broad scope, they become even more important.

## How to Read Code as Reading Decisions, Not Reading Lines

At this stage, we reach the heart of the chapter. High-level code reading is not a systematic pass from line to line, but an attempt to understand what decisions created the structure we see before us.

When we read code only at the syntax level, we ask what it does. When we read code at the engineering level, we ask why it's built this way and not another. This is the transition from technical reading to reading decisions.

To read code this way, it's worth adopting a simple way of thinking: not to settle for what's in front of your eyes, but to ask what options were rejected along the way. Every line of code represents a choice.

If the logic is inside the Handler, it was decided not to extract it to a service layer. If a function returns more information than needed, it was decided not to narrow its responsibility boundaries. If there's no explicit failure handling, it was actually decided to assume everything will work as expected.

Let's take for example the line:

const student = await db.students.findById(studentId);

In technical reading, this is simply a fetch of student data. But in reading decisions, this line says something broader: the API layer accesses the data layer directly. This is a design decision, because it forgoes a mediation layer that could have concentrated validation, Cache, or additional business logic. Once you read the code this way, you no longer see just a single action, but a structural choice.

The same is true when the Agent changes dozens of files to "improve performance." In superficial reading, you see many small improvements. In engineering reading, you see one big decision: the responsibility for handling performance was distributed across many parts of the system. This is no longer just a line of code, but an entire conception of the problem and how to handle it.

Therefore, instead of reading code as a sequence of instructions, it's worth reading it through several fixed questions:

Why is this code located precisely here

What responsibility was placed on it in practice
