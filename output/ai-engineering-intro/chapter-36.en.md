# Key Features of AI Agents

This slide breaks down the general concept of "agent" into a list of functional requirements. It defines what transforms an AI system from just a "chatbot" into a complex software system capable of managing workflows.


**The main components:**

• **Autonomy:** The ability to break down a large goal (e.g., "prepare a sales report") into sub-tasks without the user needing to guide every step.

• **Perception:** Beyond text only. The agent is capable of processing multi-modal inputs like real-time data feeds or sensors.

• **Reasoning:** Using logical work frameworks like "Chain-of-Thought." The agent "thinks" before it acts, evaluates possible outcomes, and plans a sequence of actions.

• **Tool Use:** Interaction with the external world. Running code, API calls, and using third-party applications.

• **Persistence:** Long-term memory. The ability to remember previous interactions and user preferences to improve performance over time.

• **Self-Correction:** The ability to identify a "dead end" or error in the process and automatically change strategy.

• **Proactivity:** The agent doesn't just wait for a command. It can initiate an action or alert based on environmental changes or defined schedules.






**Constructive skepticism:**

This list of features is the "wish list" of every AI developer, but in Production, they create difficult engineering challenges:

1. **The self-correction illusion:** In reality, agents often enter loops of "correction hallucinations" - they identify an error and try to fix it with another error, burning tokens without making progress.

2. **Memory complexity:** Managing long-term memory is not just storing text in a DB. The challenge is retrieving the relevant piece of information at exactly the right moment without flooding the context window with noise.

3. **Dangerous proactivity:** A system that initiates actions by itself requires very strict protection mechanisms (Guardrails). Without oversight, a proactive agent can perform irreversible or expensive actions due to misinterpretation of an environmental change.

<img src="/ai-engineering-intro/assets/image-25.png" alt="image-25.png" width="709" height="269" />

**Strengths in the illustration:**

• It sets a clear standard for what counts as a "quality agent."

• It emphasizes that an agent is a combination of cognitive capabilities (Reasoning) with technical capabilities (Tool Use).

**Important to emphasize:**

These features are what differentiates a toy from a product. Note **Persistence** and **Self-Correction**. These are the two hardest features to implement. An agent without memory is an agent with amnesia, and an agent without self-correction is an agent that breaks at the first obstacle. As programmers, our job is to build the infrastructure that supports these features - vector databases for memory and control logic for self-correction.

