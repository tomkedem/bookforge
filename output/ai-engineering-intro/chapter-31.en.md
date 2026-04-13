# Defining the Discipline: Context Engineering


This illustration changes the terminology and clarifies that what we thought was the entire profession is actually just a small part of a much broader picture.

**The main components:**

• **Prompt Engineering (The inner circle):** Focus on the text itself. The wording, tone, techniques like Chain of Thought or Few-shot. This is the "how" we address the model.

<img src="/ai-engineering-intro/assets/image-20.jpg" alt="image-20.jpg" width="401" height="232" />

• **Context Engineering (The broader envelope):** The discipline that surrounds the prompt. Includes everything that happens **before** the text is sent: information retrieval, relevance ranking, user memory management, and dynamic selection of the right tools for the situation.

• **The icons around:** Vector databases, filters, and API connections. These are the "gears" of context engineering that turn it into a software task and not just a writing task.

**Professional analysis and constructive skepticism:**

The common mistake in the market today is the expectation that a "magic prompt" will solve problems of missing or outdated data. In production systems, prompt engineering is fragile. A small change in the model version can destroy a prompt that worked great. Context engineering, on the other hand, is **more robust** because it's based on data architecture and not just verbal "magic."

**Strengths in the illustration:**

• **Paradigm shift:** It elevates the developer's status from "request writer" to "system engineer."

• **Clear hierarchy:** It shows that even the best prompt in the world isn't worth much if it operates within an empty or wrong context.

**Important to emphasize:** Prompt engineering is art, but context engineering is science. If you want to build a product that works at Scale and not just in the Playground, you must stop wasting all your time changing words within the prompt and start investing in improving the information that surrounds it. The question is not "how to ask?", but "what to give the model so it succeeds?".
