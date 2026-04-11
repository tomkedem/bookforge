# Chapter 3: Mental Debugging for a System Where Parts Were Written Automatically

In the previous chapters, we learned to break down requirements and read code as reading decisions. Now we must ask a more difficult question: what will happen when this code starts running.

When part of the code is written by an Agent, it's very easy to receive a flow that looks correct, organized, and convincing. Precisely because of this, the programmer must preserve their engineering ability: to stop, run the flow in their head, and identify in advance where code that looks locally correct is about to break systemically.

Code that looks correct within a file still hasn't proven itself. The real test begins when it encounters time, load, competition for resources, and partial failures. Here begins the role of mental debugging: the ability to identify in advance under what conditions it will break.

**When an Agent writes fast, the programmer's responsibility is not to type more, but to think better.**

## Logical Tracking of Execution Flow

When we read code, it's easy to understand each line separately and feel that everything is fine. Fetch, calculate, save. Everything is clear, everything is organized. But a system is not a collection of isolated lines. It's a sequence of actions that occur in time.

Logical tracking means running in your head the chain of events the code creates, not just as it's written, but as it actually occurs within the system. This is one of the most important skills the programmer must preserve, precisely when part of the code is written by an Agent. The Agent tends to complete local logic well, but doesn't always take into account how time affects its correctness.

Let's examine a seemingly simple flow for updating a student's credit points in Lomda:

const student = await db.students.findById(id);

const newBalance = student.credits + awardAmount;

await db.students.update(id, { credits: newBalance });

At first glance, the code looks completely correct. It's readable, organized, and does exactly what was requested. But logical tracking doesn't just ask what the code does, but what might happen between step and step.

Here a dangerous gap is created: the code reads the point state, calculates a new value, and only then writes it back. If during that time period another operation updated the same points, the calculation is already relying on information that has become outdated. The result is overwriting a previous update and loss of information.

The problem, then, is not in the calculation itself, but in the gap between reading and writing. As long as we read the code only as a syntactic sequence, this gap is almost invisible. Once we run the flow in our head, it immediately becomes a breaking point.

This is exactly where the programmer's engineering ability is tested. An Agent may produce code that looks correct, because it closes local logic well. The programmer, on the other hand, must ask what else might change while the function is running. This is the difference between fast writing and systemic understanding.

Therefore, when you perform logical tracking, always ask:

Where does the code read existing state

How much time passes until it writes new state

What else might change during that time period

What will happen if the value read is no longer current at the moment of writing

In simple systems, this gap may not cause visible damage. In real systems, it's one of the most common sources of lost updates, data corruption, and bugs that are very hard to reproduce.

## Identifying Parallel States

If in the previous section we examined what happens within a single flow over time, here a different question arises: what happens when two different flows operate at the same time on the same data.

This is one of the places where code written by an Agent may look very correct, but be fragile in practice. The Agent tends to solve well the logic of a single request. The programmer must check what will happen when two different requests try to perform the same action almost at the same moment.

Let's examine a simple example of purchasing a course:

const student = await db.students.findById(id);

if (student.credits >= coursePrice) {

// Agent assumes nothing changes here...

await db.students.update(id, {

credits: student.credits - coursePrice

});

return NextResponse.json({ success: true });

}

At first glance, the logic looks correct. If the student has enough points, the system approves the purchase and deducts the price from the balance. But engineering reading doesn't stop at the condition itself. It asks what will happen if two different requests arrive almost at the same time.

Suppose the student clicked the purchase button twice, or opened two different tabs and performed the same action in parallel. Both requests will read the same initial state, both will see there are enough points, and both will pass the condition. From here on, each will act as if it's alone in the system.

The result is a logical error: two different actions were approved based on the same state, even though only one of them should have passed. The problem is not in the condition itself, but in the hidden assumption that the state checked will remain correct until the moment of update.

Here again the programmer's engineering ability is tested. An Agent may produce readable and convincing code for a single request. The programmer needs to ask if the same request could run twice, and if two such requests could make a decision as if they're alone in the world.

Therefore, when you read code, ask:

Can two different requests run here in parallel

Do they both rely on the same initial state

Can both make a decision as if they're the only ones in the system

What will prevent both from performing a double or contradictory update

In a small system, this may look like an edge case. In a real system, it's one of the most common sources of duplications, inconsistency, and incorrect data.

## Identifying Logical Blocks

There are cases where the problem is not an incorrect calculation, but a state where different processes prevent each other from progressing. Each of them holds a certain resource and waits for another resource already taken by another process.

This is a type of failure that's very easy to miss when reading each function separately. An Agent may write each flow by itself in completely correct form. The programmer's engineering ability is tested in the ability to see how several different flows meet each other.

Suppose in the Lomda system there are two different processes. One closes a course, and the other updates a student's profile.

**The course closing process works as follows:**

Locks the course record

Updates student grades

Releases the lock

**The student profile update process works as follows:**

Locks the student record

Updates the courses they're enrolled in

Releases the lock

Now try to run both these flows in your head at the same time. One process has already taken the course and is waiting for the student. Another process has already taken the student and is waiting for the course. Each of them holds part of the resources and waits for the other part. In such a state, the system may get stuck.

To identify a logical block, it's not enough to read what each function does separately. You need to map the order of access to resources. Once two different flows access the same resources in reverse order, a real risk of blocking is created.

Therefore, when you read code involving locks, queues, or waiting for external resources, ask:

What are the resources the process takes along the way

In what order does it take them

Is there another flow that takes the same resources in a different order

What will happen if both processes run together

Here again the difference between code that looks locally correct and a system operating under real conditions is expressed. An Agent can successfully complete the flow of each function by itself. The programmer must check whether all these flows are still able to progress when they operate together.

A logical block doesn't always appear as a clear error message. Sometimes it will simply look like a request that doesn't end, a screen that doesn't progress, or a system that seems frozen without explaining why.

## Identifying Uncontrolled State Multiplication

Not every failure stems from timing, resource competition, or blocking. Sometimes the problem is quieter: the system allows too many states, and some of them were never supposed to exist.

This is one of the places where mental debugging becomes especially essential. When we read code, we're not just checking what changed in a particular line, but what state space this change creates. If the system allows too many combinations of flags, fields, and conditions, it may enter states that the code itself was never designed to handle.

This is also a pattern typical of code written by an Agent. The Agent tends to solve each specific requirement by adding another field, another condition, or another flag. From a local perspective, each such addition looks reasonable. The programmer's engineering ability is tested in the ability to see what happens when all these additions accumulate into one system.

Let's examine for example a student entity in the Lomda system. Suppose over time three fields were added to it:

- isActive

- isSuspended

- hasGraduated

Each of them looks reasonable in itself. Each solves a specific need. But once we look at them together, the problem begins. Can a student be both active and graduated. Can a suspended student still be considered active. Does graduation cancel suspension, or are these two independent states.

Here begins uncontrolled state multiplication. The system no longer holds one clear state, but a collection of local signals that can combine in contradictory ways. At such a moment, even if each individual update looks correct, the overall picture may become inconsistent.
