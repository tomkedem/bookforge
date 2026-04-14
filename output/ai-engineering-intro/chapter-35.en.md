# AI Agents

Until now we talked about the model as a passive tool waiting for information (RAG). Here we present a quantum leap: the model becomes an active system that operates in the world. This is the transition from "chatbot" to "digital worker."

<img src="/ai-engineering-intro/assets/image-23.png" alt="image-23.png" width="533" height="393" />

**The main components:**

• **Autonomous system:** The agent doesn't just answer a question. It receives a goal and decides by itself the order of actions required to achieve it.

• **Environment perception:** The agent "sees" the current state through inputs (text, files, API responses).

• **Reasoning:** The model uses its logical capabilities to break down a complex task into sub-tasks.

• **Tool use:** This is the heart of the agent. It can run code, access a database, or send an email. It doesn't just talk, it does.

• **Minimum human intervention:** The aspiration is to close the loop so the agent corrects itself and continues until task completion.

**Constructive skepticism:**

The term "autonomous" sounds promising, but as programmers and team managers, it should raise alarm bells:

1. **Infinite loops:** Agents can get "stuck" in faulty logic and waste thousands of tokens (and money) without reaching a result.

2. **Loss of control:** Unlike regular code, it's hard to predict in advance every action the agent will choose to take. This is a huge challenge for Production systems that require stability.

3. **Costs (Token Overhead):** Agents that "think out loud" (like in the ReAct method) consume an enormous amount of tokens on every small step.

**Strengths in the slide:**

• It clearly defines the difference between a regular LLM and an Agent (the ability to make decisions and act).

• It sets the final goal: achieving specific objectives with minimal human intervention.

**Important to emphasize:**

The agent is the highest level of "context engineering." For an agent to work, it needs context that includes not just data (RAG), but also clear **tool definitions** (Tools) and a mechanism to manage its steps. If RAG is an "open book test," then an agent is an "intern" we sent to the office with access to a computer and phone. Our responsibility is to give them the right instructions and tools so they don't cause damage.

