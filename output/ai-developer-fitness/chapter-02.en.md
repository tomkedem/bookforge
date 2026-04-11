# **Chapter 1: Breaking Down Problems Before Activating the Agent**

In regular development work, a vague requirement would stop the work. A human developer cannot write good code when they don't fully understand what the problem is, what the constraints are, and what success looks like.

An Agent doesn't stop. It guesses.

Therefore, the most critical step in working with AI occurs before the first prompt. Before requesting code, you need to stop, break down the task, and transform a business requirement into a clear engineering contract.

The emphasis in this chapter is not on how to ask the Agent to work, but on how to define the boundaries of the game in advance, so it doesn't build a convincing but incorrect solution for you.

## **The Vague Requirement Trap: Between Architectural Failure and Output Illusion**

A vague requirement is any request that leaves the Agent free to determine your architecture for you. In the traditional development world, such a requirement would simply get stuck. A human developer cannot guess what the system needs without asking clarifying questions.

An Agent operates differently. It tends not to stop and alert that engineering data is missing, but to complete what's missing according to the most reasonable path and produce code that looks like it works. This is exactly where the trap lies: while building a flawed system structure, it also creates the impression that everything is fine.

At the architectural level, a vague requirement causes the Agent to build a single solution that does everything. When clear boundaries aren't defined, it concentrates business logic, data access, and external service work in the same implementation. The result is strong coupling between parts that should have remained separate.

**About the Book's Companion System: Lomda**
Throughout the book, we will use an example system called Lomda, a learning platform built to allow us to discuss real engineering problems within one consistent context. Instead of switching to a different system in each chapter, we will return again and again to the same system, and thus we can see how local decisions affect architecture, workflows, data, and user experience over time.

Lomda is not important in itself, but as a working framework. It gives us a common language and concrete examples such as: lessons, students, grades, summaries, alerts, queues, and AI services.

Through this system, we will examine how to work correctly with Agents, how to break down problems, how to identify hidden assumptions, and how to maintain engineering judgment even when implementation is written quickly.

**Let's examine a common requirement in the Lomda system:**

"I need a service that sends lesson summaries to students by email at the end of each day."

Without early decomposition, the Agent will write a script that performs the following actions in sequence: it queries the database for who studied, pulls the content, calls the OpenAI API to generate a summary, and sends the email through an external service.

The problem will begin when you want to change something. If you want to replace the email provider, you'll need to touch the code that summarized the lessons. If you want to move summary generation to asynchronous processing through a queue, you'll discover that the code the Agent created is so intertwined that the change will require rewriting everything. The machine didn't build you a maintainable service. It built a rigid black box.

**The Perceptual Level: When Code Looks Too Correct**

The risk of vague requirements is exacerbated by the illusion of convincing output. Agents excel at writing code that looks extremely professional: variable names are precise, structure is clean, and syntax is completely correct. This illusion weakens our critical mechanisms. When a programmer receives such code within seconds, it's very easy to approve it too quickly just because it looks ready.

In the Lomda system, we asked the Agent:

"Add a mechanism that limits the student to only three attempts to solve an exam."

The Agent proposed the following solution:

**Algorithm: Attempt Limitation (Agent Implementation)**

- Receive exam request from student.

- Check in a local variable in server memory how many attempts were made.

- If the counter is less than 3, execute the exam and increment the counter.

- Otherwise: block the request.

This algorithm will pass every test on your personal computer. It will look perfect. But the problem is that the Agent built a solution for a single server.

In Lomda's real system, the service runs on ten different servers behind a Load Balancer. A student will be able to make thirty attempts, three on each server, because the information is not stored in a central location.

The Agent didn't make a mistake in the classic sense. It simply solved the problem in the easiest way that allows it to produce convincing output that looks correct. The speed at which the code was created makes it difficult for us to ask the hard questions about infrastructure and edge cases. A vague requirement causes us to accept fragile architecture just because it's wrapped in nice packaging of seemingly working code.

The lesson is clear: when we give up the decomposition stage, we're not really saving time. We're simply transferring to the Agent the right to make architectural decisions for us.

## **Systematic Decomposition Process: Requirement, Sub-problems, Constraints, and Success Criteria**

To avoid falling into the trap where the Agent simply completes what's missing according to its own way, we must adopt a discipline of problem decomposition. Decomposition is not just a technical step. It's your way of defining work boundaries, constraints, and conditions under which the Agent operates.

The process consists of four anchors that must appear in every task you hand over to the Agent for automatic execution:

**A. Requirement Definition**

The requirement is the business goal, but in clear engineering language.

Instead of telling the Agent "I want an alert system,"

Define the essence: "Create an asynchronous mechanism for updating users about events in the learning system."

This phrasing directs the Agent to the fact that this is not just a pop-up message, but a mechanism that needs to run in the background.

**B. Isolating Sub-problems**

This is where the heart of architectural work lies. The common mistake is asking the Agent to solve the problem as one piece. Correct decomposition separates business logic, data access, and external interface.

In the Lomda system, if we want to add a feature of "calculating a weighted average grade for a student including bonuses for persistence," the systematic decomposition would look like this:

- **Sub-problem 1: The Algorithm**
A function that receives a list of grades and time parameters, and returns a number, meaning the grade. The Agent will write only the mathematical logic. It doesn't need to know where the data comes from.

- **Sub-problem 2: Data Layer**
A service responsible for collecting relevant data from the database and Cache.

- **Sub-problem 3: Coordination Layer**
The coordination layer connects the parts and decides when to activate the calculation.

**C. Defining Constraints**

Constraints are your protective walls. The Agent tends to choose the easiest solution, even if it doesn't fit your infrastructure. You must define limitations in advance:

**Infrastructure Constraints:** "The solution must run inside a cloud function (Lambda) with a 256MB memory limit."

**Security Constraints:** "It is forbidden to expose identifying information (PII) in system logs."

**Dependency Constraints:** "Only standard language libraries should be used without importing additional external packages."

**D. Success Criteria and Output Contracts**

Don't ask the Agent "what do you think of the solution."

Define exactly what a correct solution looks like using a contract. Define the exact structure of the return object.

For example: "The output must be a JSON object containing the status key as a boolean, and calculated_grade as a decimal number. Any other format will be considered a failure in task execution."

Using a clear and well-defined contract allows you to run an automatic test on what the Agent produces before integrating it into the source code.

## **Identifying Hidden Assumptions the Agent Will Complete on Its Own**

One of the central characteristics of language models is the tendency to complete what's missing. Sometimes the Agent will indeed stop, ask what you meant, or present several possible assumptions to choose from. But you can't rely on it always identifying on its own when critical information is missing. In places where clear boundaries weren't defined, it may still complete what's missing according to the most reasonable path it has seen before.

This is exactly where the problem begins. The assumptions the Agent completes are not based on your system, your infrastructure limitations, or the architectural history of the product. They are based on the most general pattern that seemed reasonable to it.

Hidden assumptions are problems waiting for the moment when the system meets real conditions. The code looks correct, it runs, and it may even pass basic unit tests. But in practice, it relies on overly optimistic scenarios that the Agent chose to close the gaps that weren't defined for it.

Let's analyze an example from the Lomda system. Suppose you asked the Agent: "Write a service that receives a PDF file of a lecture and extracts text from it to generate a summary for the student."

The Agent may quickly produce code that looks professional, clear, and convincing. But even if it asks a question or two along the way, it's still very possible that it will complete several critical assumptions on its own that weren't explicitly stated.

The code it produces may use a common PDF processing library and look completely correct. In practice, it may hide three critical hidden assumptions:

- **Memory Assumption**
The Agent assumes the file will always fit in the server's RAM at once. If a student uploads a 500-page PDF with high-resolution images, the server may crash with an Out of Memory error. The Agent didn't plan a batch reading mechanism because you didn't define it explicitly as a constraint.

- **Content Type Assumption**
The Agent assumes the text in the PDF is always extractable. It didn't consider a PDF scanned as an image that requires OCR. If the file is scanned, the service may return an empty string or garbled text without alerting to the problem.

- **Response Time Assumption**
The Agent wrote a synchronous function that waits until extraction is complete. In a modern system, if such an operation takes more than ten seconds, which is quite possible with a heavy PDF, the Gateway may disconnect. The Agent assumed the operation would always finish fast enough not to block the server.

**How to Hunt Hidden Assumptions**

As programmers, your role in task decomposition is to go over the solution the Agent proposes and ask:

**What did the machine assume that it doesn't know about us?**

To reduce the Agent's guessing space, you should define edge constraints already at the decomposition stage:

"Files up to 1GB must be handled using Streaming only."

"In case of a PDF without a text layer, the function must return an UNSUPPORTED_FORMAT error."

"The extraction process must be performed asynchronously through a Background Job, with status updates in the database."

Identifying hidden assumptions requires you to develop professional skepticism. You should assume that the Agent will often gravitate toward the simplest implementation path, and then block that path with explicit technical definitions.
