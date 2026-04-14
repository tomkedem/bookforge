# Detailed Context Window Structure
<img src="/ai-engineering-intro/assets/image-18.png" alt="image-18.png" width="519" height="313" />


In this illustration we "open the engine" and look at the internals of the context window. This is the stage where theory becomes real architecture.

**The main components:**



• **Prompts:** This is not just the user's question, but the entire System Prompt. These are the house rules: defining the model's role, its limitations, and the format in which it must answer.

• **History / Memory:** The layer that enables conversation continuity. The application needs to decide how far back to remember. Too long a memory can confuse the model or exceed the token budget.

• **Resources:** This is where external knowledge injection (RAG) takes place. This is the specific information we brought from documents or databases so the model can rely on facts and not make up answers.

• **Tools:** The definitions that allow the model to invoke external functions (Function Calling). This could be an API, this could be MCP. And this is the part that transforms the model from a textual engine to a tool capable of performing actions in the real world.

**Constructive skepticism:**

There's a tendency to think that "the more information in context - the better." This is a common mistake. Too much information creates noise, increases response time, and inflates costs. Models sometimes suffer from the "Lost in the Middle" problem, where they tend to ignore information appearing in the middle of the context window. Quality engineering is first and foremost the art of filtering and distillation.

**Important to emphasize:**

Context is expensive real estate. Every component that goes inside has a cost in tokens and accuracy. Our role is to manage a "token budget." We should ask ourselves before every call to the model: Does this piece of information really advance the model toward solving the task, or does it just get in its way?
