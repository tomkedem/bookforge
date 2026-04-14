# LLMs Are Limited to the Data They Were Trained On: The "Memento" Effect

<img src="/ai-engineering-intro/assets/image-14.png" alt="image-14.png" width="434" height="289" />

This illustration clarifies that our "doctor" is actually a tragic character, similar to Leonard Shelby from the movie **Memento**: he has identity and skills, but he's stuck at a specific point in time.

1. **Cognitive Freeze**

The LLM's knowledge is locked at the moment the training phase ended (Training Cutoff).

**The meaning:** The model doesn't "live" in our world. It doesn't know anything that happened after a certain date. It doesn't read news, it doesn't follow API updates, and it's not aware of changes in industry standards unless they were part of its original data set.

2. **The "Memento" Metaphor - Context vs. Memory**

Why is this movie the perfect analogy?

• **Long-term memory (Training):** These are the fixed parameters. This is the model's "past," what it managed to compress inside before "its memory was damaged."

• **Short-term memory (Context Window):** These are Leonard's notes and tattoos. The model can "remember" new information only if we push it into the Prompt (like in RAG). As soon as the conversation ends and the window closes, everything is erased. The model returns to being exactly the same "doctor" from the past.






**The skeptical angle:**

We must stop confusing inference with learning:

• **The model doesn't learn from you:** Unlike a human programmer who improves during project development, the LLM doesn't improve from your interaction. It only processes it. The dials (parameters) we saw in the first slides are **Immutable** (cannot be changed) at runtime.

• **The danger:** The model will try to extrapolate from the past to the present. If syntax changed in a popular code library in 2025, and the model was trained in 2024, it will give you code that's "correct" statistically but simply won't work at Runtime.

**Recommendation:**

"The LLM is a frozen expert. If you want it to know the reality of 2026, you must be its memory.

RAG (Retrieval-Augmented Generation) is the 'tattoo' we give the model so it can function in the modern world."

