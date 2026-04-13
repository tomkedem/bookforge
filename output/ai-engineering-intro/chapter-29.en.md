# Defining the Workflow (The Flow)


The illustration defines the "rules of the game" of the system you're building.

**The main components:**

• **The User:** The raw input. It's important to understand that what the user wants is not always what they write.

• **The Application (App):** This is the center of gravity. Here lies your logic. The application is not just a "pipe" that passes text. It's the central processor. It's the one that decides which data to retrieve, which filters to apply, and how to "package" everything for the model.

<img src="/ai-engineering-intro/assets/image-18.png" alt="image-18.png" width="519" height="313" />

• **The Context Window - The empty purple rectangle:** This is the real estate where processing takes place. The fact that it's empty in this slide emphasizes that it's **a resource to manage**. This is the model's operational Memory.

• **The LLM:** The engine that sits at the end. It receives what you cooked for it in the context window and outputs a result.

**Professional analysis and constructive skepticism:**

A common but wrong assumption is that the LLM is the "brain" that holds all the knowledge. This slide corrects this mistake and shows that the LLM is simply an **Inference Engine**. It's "dumb" without the information streamed to it in real-time.

**Strengths in the illustration:**

• It clearly separates the application from the model. This is critical for developers who tend to think they're "programming the LLM." In practice, they're programming the application that builds the context for the LLM.

• It isolates the "context window" as an independent entity. This allows you to talk about its limitations (token count, costs, Latency).

**Important to emphasize:** As programmers, our job is not "to talk to the LLM," but **to fill the purple rectangle** in the most efficient way possible. This rectangle is the only Input the model knows at any given moment. If the rectangle is empty or messy, the result will be accordingly.
