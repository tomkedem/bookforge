# Agent Workflow Structure (Agentic Workflow)

While the previous illustration focused on agent features, this illustration focuses on how it operates at the system level. It presents the technical structure that separates the LLM as a thinking engine from the Agent as an operational logic layer.




**The main components:**

• **Agent:** The managing center (Orchestrator). It's not the language model itself, but the code that manages the loop, makes decisions, and communicates with other components.

• **Prompt Template:** Provides the agent with its "identity" and operation instructions (Instructions). This is where the System Prompt and guiding rules are defined.

• **LLM:** Serves as the "inference component" (Planning / Reasoning) only. The agent sends information to it and receives a decision about the next step.

• **Tools:** The ability to perform actions (Actions) in the external world - running code, calling APIs, or accessing databases.

• **Memory:** A mechanism for storing and retrieving information (Store / Retrieve). This is the component that allows the agent to maintain consistency over time and not forget the goal.

• **User:** The input source (Prompt) and the destination for receiving the final answer (Response).

<img src="/ai-engineering-intro/assets/image-26.png" alt="image-26.png" width="616" height="380" />



**Constructive skepticism:**

The diagram presents a clean separation between components, but in reality the lines are blurry.

1. **The agent is code, not magic:** The central "Agent" box is often simply a while loop in Python. The real complexity is in State Management between the different steps.

2. **The Reasoning bottleneck:** The diagram assumes the LLM will always return a valid action plan. In practice, a small reasoning error leads to a wrong action in Tools, which can create irreversible damage if there are no "safety guardrails" (Guardrails).

3. **Memory costs:** Store and Retrieve sounds simple, but as the conversation lengthens, memory management becomes an optimization problem of token costs versus information relevance.

