# The Final Project: Lomda Engineering Journey

We've reached the finish line of the book. The project before you isn't a theoretical test and isn't an academic exercise. This is a simulation of a real workday of a software developer.

Throughout the book, you've encountered Agents that can write code at impressive speed. You learned how to dictate direction to them through precise prompts, how to identify architectural failures in automatically generated code, and how to protect real systems from errors that seem small but can turn into disasters in production.

Now all these principles converge into the final project, Lomda Engineering Journey.

Your goal isn't just to make the code work.

The goal is to exercise engineering judgment.

The Agent is at your disposal as a powerful work tool.

But the responsibility for the system, for security, and for the production server remains yours alone.

**Preliminary Preparations: Setting Up the Work Environment**

The project is performed on the GitHub repository accompanying the book.

Make sure you've pulled the latest version of the repository into your IDE environment.

Navigate in the directory tree to the new additions under - app/api/final-project

and under - app/exercises/final-project.

## Stage 1: Receiving a Vague Requirement and Breaking Down the Problem

In the app/exercises/final-project directory, you'll find the file TICKET-842.md.

The product manager opened an urgent requirement there to add an API route for a student appeals mechanism before the end of semester.

The initial instinct is to copy this ticket to the Agent and ask:
"Write me an API Route in Next.js for this."

Don't do that.

**Your Task:**
Read the requirement. Open a file named QUESTIONS.md in the same directory and write in it at least five critical business and architectural questions that are missing from the requirement.

For example:

Does the Route require lecturer identity verification?

What happens if the lecturer clicks twice by mistake?

Can an appeal be submitted twice for the same exam?

Only after these questions are clear to you, proceed to the next stage.

## Stage 2: Hostile Code Review

A junior developer on the team, who used the Agent blindly, already tried to solve the task. Their code is at:

app/api/final-project/appeals-naive/route.ts

The code shows no TypeScript errors and looks correct at first glance, but it contains severe engineering risks.

**Your Task:**
Perform independent and critical code reading. Find at least three depth errors in this file that could crash the system or create a security breach.

Hints:

Check how the code accesses the database.

Check how it handles the incoming JSON object.

Look for lack of transaction management.

Add your comments as direct comments inside the file.

## Stage 3: Architectural Decision Under Load

Before you write the correct solution, you must make an architectural decision.

A Next.js application running in a Serverless environment is limited in runtime. During exam periods, thousands of students may submit an appeal. If database update and email sending to the lecturer take more than ten seconds, the API will fail.

**Your Task:**

Decide whether it's better to implement the Route as a regular synchronous operation, or to build a Background Job or Queue mechanism.
