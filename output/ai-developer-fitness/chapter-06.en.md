# Chapter 5: Defensive Dialogue Engineering - Stopping Failure at the Prompt Stage

In the previous chapters, we learned to identify weak decisions, run flows in our heads, and critique code that looks too convincing. But if all our defense starts only after the Agent has already written the code, we're responding too late.

Here begins the next stage in engineering work with Agents: not just checking the output, but designing in advance the conditions under which it will be created.

When an Agent receives a request that's too general, it tends to produce a generic, optimistic, and naive solution. It will work well on the functional result, but easily ignore the real constraints of the system: distributed structure, external dependencies, state management, concurrency, security, and failure paths. Therefore, the programmer's responsibility doesn't start only at code review. It starts already in formulating the request.

This is the heart of defensive dialogue engineering: the ability to formulate a prompt that doesn't just request what the Agent needs to build, but also dictates within what boundaries, under what constraints, and in what ways it's not allowed to solve the problem.

When an Agent produces code fast, the programmer's engineering ability is measured not only by what they identify in hindsight, but also by what they know to prevent in advance.

## Why You Can No Longer Work with an Empty Prompt

One of the most common mistakes in working with Agents is formulating a request that defines only the desired result, but not the system conditions in which the code is supposed to operate. Such a request can be called an empty prompt: a prompt that requests functionality, but doesn't provide context, constraints, or boundaries.

Suppose a developer writes to the Agent:
"Write a function in Node.js that registers a new student to the Lomda system and saves the data to the Database."

At first glance, this seems like a reasonable request. It's clear, short, and has a defined result. But from an engineering perspective, this is a request that leaves the Agent too much room for incorrect assumptions. It doesn't tell it how the system is built, what it can't assume, where the responsibility boundaries are, and what risks it can't ignore.

When an Agent receives such a request, it fills in the gaps itself. Not from real understanding of the system, but from the most statistically probable solution it's seen before. Therefore it tends to assume, even if not explicitly, that the system runs in a single process, that database calls succeed normally, that there's no resource competition, and that there are no special system constraints.

Here exactly the programmer's engineering ability is tested. The Agent doesn't know what wasn't told to it. The programmer's responsibility is not to expect it to guess the architecture, but to formulate it. Not to hope it will understand the unwritten rules of the system on its own, but to make them part of the request itself.

Therefore, an empty prompt isn't just a short prompt. It's a prompt that transfers a problem to the Agent without its physics. The result will often be clean, elegant, and generic code, but one that breaks immediately when it meets the real system.

The most important professional transition in working with Agents is the transition from a prompt that requests a result, to a prompt that defines conditions. Not just what to build, but also in what environment, under what constraints, and in what ways it's not allowed to solve the problem.

## Injecting Infrastructure Context

Before presenting the Agent with the business or logical problem, you need to define for it the reality in which the code is about to operate. It's not enough to request functionality. You must also provide environment conditions: whether it's a distributed system, whether the service runs in several parallel instances, where State is stored, and what central components dictate the rules of the game.

Here exactly the programmer's engineering ability is tested. The Agent won't invent the correct architecture by itself. It will fill in the gaps according to what seems reasonable to it. The programmer's responsibility is to replace general probability with real context.

In many modern Agents, you can anchor some of this context in dedicated instruction files within the project, like Markdown files that define for the Agent how to work with the repository. This is an important improvement, but it doesn't change the principle: the Agent still must receive not only the task, but also the environmental rules in which it must operate. Whether the context is delivered within the prompt itself or anchored in project instruction files, the responsibility to define it remains with the programmer.

By default, a language model tends to assume an environment that's too simple: a single process, available local memory, direct data access, and no real resource competition. If we don't dictate a different reality to it, it will produce code that looks correct on a local development computer, but breaks the moment it meets a distributed system.

Therefore, injecting infrastructure context is not a nice addition to the prompt. It's an essential part of the requirement. In fact, it's a fixed opening paragraph that defines for the Agent the physics rules of the production environment.

## Forcing Failure Scenarios

Agents tend toward dangerous optimism. By default, they write code suited to the happy path: a state where the network is available, the database responds immediately, and external services operate without failure. In a real system, this is a dangerous assumption.

To prevent the Agent from building a solution that breaks at the first encounter with reality, you need to force it to think in advance about failure scenarios. Not to expect it to add defense mechanisms on its own initiative, but to define them as an explicit part of the requirement.

Here again the programmer's engineering ability is tested. The Agent tends to complete the most direct and clean path to performing the action. The programmer must force it to also deal with what happens when the world stops cooperating.

The correct way to do this is to insert explicit requirements into the prompt for error handling, exceptional response times, retries, and situations where an operation succeeds only partially. Once failure scenarios become part of the request, the code the Agent produces also stops being theoretical and becomes more resilient.

**Error Handling:**
You must assume the external payment service may respond slowly, return a 503 error, or fail completely.
Implement a hard timeout of 3 seconds for the request.
Add up to 3 retries with increasing delay between attempts.
If the operation fails after all attempts, a compensation operation must be performed to prevent data inconsistency.

This phrasing fundamentally changes the nature of the output. It prevents the Agent from settling for the optimistic flow, and forces it to build a solution that takes into account the less comfortable sides of reality.

## Setting Walls and Boundaries

Agents tend to choose the shortest path to the result. From their perspective, if you can access data directly, bypass a service layer, or break a complex operation into several separate write operations, that's a reasonable choice. Locally, sometimes it even looks elegant. Systemically, this may be exactly the way the architecture starts to crack.

Here enters another layer of defensive dialogue engineering: not just explaining to the Agent what needs to be built, but also explicitly defining what it's not allowed to do.

This is one of the deep differences between regular work with an Agent and engineering work with it. If you don't set walls, the Agent will fill in the gaps according to the most efficient path in its view. If you set clear boundaries, it will be forced to find a good solution within the defined area of operation.

**Architecture Constraints:**
It's forbidden to directly access tables or the User Service database.
To get student data, only the service's internal API or the existing Client in the project should be used.

**Data Constraints:**
The operation requires updating several records together. It's forbidden to perform these updates as separate units. All write operations must be wrapped in a single Transaction. If one operation fails, a full Rollback must be performed.

Once such boundaries are set within the prompt, the dynamic changes. Instead of waiting to see which contract the Agent violated this time, we build in advance a closed path that prevents it from choosing dangerous shortcuts.

## The Engineered Prompt Template: The Developer's Toolbox

Until now we talked about principles: injecting context, forcing failure scenarios, and setting walls and boundaries. Now we need to turn all these into a fixed work tool. Without a clear template, even an experienced developer will find themselves forgetting an important constraint, omitting an infrastructure detail, or asking the Agent for a solution that's too good at the local level and too bad at the system level.

A good template for an engineering prompt is built from four parts:

- **System Context**
Here you define where the code will run and under what conditions.
For example: whether it's a distributed service, whether there are several parallel instances, where State is stored, and what central components dictate the rules of the game.

- **The Exact Task**
Here you define exactly what needs to be built.
Not too general a description, but a clear and focused task.

- **Walls and Boundaries**
Here you define what the Agent is not allowed to do.
What shortcuts are not permitted, which services or tables it can't touch directly, and what architectural rules it must respect.

- **Error Handling and Failure Scenarios**
Here you define what the Agent must take into account when reality doesn't cooperate.
External services that fail, slow responses, retries, compensation operations, and situations where the operation succeeds only partially.

When using this template, the dynamic changes. We stop asking the Agent for "code that works," and start demanding code that operates within real boundaries.
