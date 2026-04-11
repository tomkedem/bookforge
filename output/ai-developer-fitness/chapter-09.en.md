# Chapter 8: Secure Code Against a Blind Agent

## The Illusion of Safe Code: The Statistical Trap

One of the most dangerous assumptions when working with Agents is that if the code looks clean, clear, and works well, it's probably also secure. This is a wrong assumption.

Functional quality and information security aren't the same thing. An Agent can produce a readable, organized, and very convincing function, and in the same breath incorporate a classic vulnerability like SQL injection, secret exposure, or use of a dangerous external library.

This is precisely where the engineer's capability is tested. The Agent doesn't apply security judgment. It operates from statistical patterns. If in the public code it was trained on there are fast, common, and vulnerable solutions, it may reproduce them without understanding at all that it's a risk.

In other words, the Agent doesn't ask if the code is secure. It asks what the most likely solution to produce is.

Therefore, when working with an Agent, the default must be reversed:

Don't assume the code is secure until proven otherwise. Assume from the start that every output may contain a known vulnerability, and that you are the ones who need to expose it before it enters the system.

In this chapter, we'll learn to identify three main risk areas: secret leakage from prompts, introduction of unchecked external dependencies, and writing code that interfaces with external input without hard security boundaries. The goal isn't to fear the Agent, but to work with it from a security discipline.

When the Agent writes fast, the engineer's capability is also measured in the ability to assume from the start that the code needs suspicion, not trust.

## Secret Leakage: The Copy-Paste Danger

One of the most practical dangers in working with Agents doesn't come from the code the Agent writes, but from the information we send to it. In moments of pressure, it's very easy to copy an error, a code snippet, a configuration file, or a full log, and paste everything into the chat window to get a quick answer. This is exactly the point where a leak can occur.

This isn't just about a password left by mistake in a file. Sometimes the leak looks much more innocent: a connection string, an access token, an internal service address, a user identifier, personal data from a log, or an infrastructure structure the organization never intended to expose.

This is where the engineer's capability is tested again. The Agent doesn't know what it was forbidden to send to it. The responsibility to stop, check, and clean the text before pasting remains completely human.

There are two habits that must become the default:

**Active Cleaning Before Every Paste**
Before pasting code, logs, or configuration files to the chat window, stop for a moment and go through the material with critical eyes. Look for keys, tokens, passwords, identifiers, internal addresses, and personal data. Any sensitive value is immediately replaced with a clear string like REDACTED or REDACTED_API_KEY.

**Complete Separation Between Secrets and Code**
If your secrets don't appear in the code, the risk is significantly smaller from the start. Code that pulls values from environment variables or a secret management mechanism is safer for work than code containing sensitive values inside it. This isn't just good security practice. It's also correct working practice with Agents.

The principle here is simple:
Before asking the Agent what to do with the code, you need to ask what this code must not expose.

Therefore, before every paste to the chat window, ask:

Is there any secret here, even if it doesn't look like a password?

Is there personal data, an identifier, or an internal system detail here?

Is this text safe even if it were read outside the organization?

Can the information be cleaned without harming the technical question?

The risk in secret leakage almost never comes from bad intention. It comes from bad habit. Therefore, the best defense here isn't fear, but discipline.

**Short Working Rule**

Before every paste to the Agent, stop, clean, and only then send.

## Invented or Dangerous Libraries: The Danger in Adding Dependencies

An Agent tends to complete an answer even when it lacks real knowledge. When asked to solve an unusual problem, it may suggest an external library that sounds reliable, suitable, and even familiar, even though it doesn't exist at all. In other cases, the library exists but isn't stable, isn't maintained, or simply isn't worthy of entering a real system.

Here the risk is no longer just a technical mistake. It becomes a supply chain risk.

If a developer copies a package name from the Agent and installs it without checking, they're essentially introducing foreign code into the system without performing any professional filtering on it. Even if the library actually exists, the very fact that the Agent recommended it doesn't constitute any approval for quality, security, or suitability for the system.

This is where the engineer's capability is tested again. The Agent knows how to suggest. The engineer must validate.

There are three things that must be checked before adding a new dependency that the Agent recommended:

**Actual Existence in the Official Source**
Check that the package actually exists in the official repository of the relevant package manager, and not just in the chat window.

**Signs of Life and Community**
Check when it was last updated, how widely it's used, whether it has active maintenance, and whether there's a recognized body behind it or at least a project that seems reliable and serious.

**Fit to the System and Organizational Policy**
Check if it's even right to add a new dependency. Sometimes the solution the Agent suggests sounds elegant, but in practice creates an unnecessary dependency on an external library for a problem that can be solved with tools that already exist in the project.

In other words, don't just check if the package exists. Also check if it's worthy of entering.

Therefore, before any installation of a library that came from the Agent, ask:
