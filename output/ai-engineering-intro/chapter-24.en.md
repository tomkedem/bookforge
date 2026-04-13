# LLM Limitations: Beyond Linguistic Fluency

This statement sets the engineering boundaries of the model. Even if it sounds like an expert (PhD), it has built-in limitations that stem from how it was built and trained.

1. **Context Window - Limited "Working Memory"**

Every model has a physical limit to the amount of text it can "hold in mind" at once.

• **The problem:** As the conversation or document gets longer, the model starts losing connection with the beginning of things. Today we know well the **Lost in the Middle** phenomenon - the model gives excessive weight to the beginning and end of the input, and neglects the information in the middle.

• **The bottom line:** The model doesn't "remember" you. It only processes what's currently inside its temporary memory window.

2. **Knowledge Cutoff - The Model as a "Snapshot"**

The model's knowledge is frozen in time. It represents the internet as it was at the moment its training ended.

• **The problem:** Without external connection (like RAG), the model is not aware of events that happened yesterday, new code version updates, or market changes. It lives inside a static "past bubble."

• **The bottom line:** The dials (parameters) we saw in the previous slides are fixed. They don't change during the conversation.

3. **Logic vs. Statistics (Reasoning vs. Probability)**

This is the most important limitation to understand professionally. The model is a statistical engine, not a logical inference engine.

• **The problem:** It can solve mathematical problems or write code not because it "understands" the rules of logic, but because it recognizes patterns of similar solutions from the training data. When encountering a completely new problem that requires original logic, the model may crash.

• **The bottom line:** We're talking about a simulation of thinking, not conscious thinking.

It's worth knowing the term **Dials** = mathematical elements in the model that can be adjusted which dictate how it calculates probabilities and are determined mainly during training. Each "dial" represents a **Weight** or **Parameter** in the model. The model includes **billions to trillions of such dials**. During training, the system "turns" them to learn relationships between words and ideas.

Note! Most dials are set **during the training phase**, not during use.

**The skeptical angle:**

We must stop treating the LLM as a "brain" and start treating it as a **statistical text processor**. These limitations are not bugs that can be fixed with a button press. They are part of the technology's definition.

**The main risk:** The model will try to answer even when it's outside its context window or when it lacks current knowledge. It won't say "I ran out of memory," it will simply continue predicting tokens based on partial information.

**Recommendation:** Don't rely on the model as a Single Source of Truth for changing data or especially complex logic. Use it for creation, synthesis, and processing, but keep the logical management of the task with you.
