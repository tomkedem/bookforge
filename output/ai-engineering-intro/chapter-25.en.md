# LLMs Sometimes Hallucinate:

One of the most discussed phenomena in AI. The precise wording is important here: hallucination is not a random bug. It's a necessary and built-in byproduct of the mechanism we saw earlier.

1. **The Technical Source: Prediction Must Continue**

As we saw in the Inference Pipeline and the Feedback Loop (Auto-regression), the model is programmed to predict the next token. When the model reaches the edge of its context window, or when it's asked to produce information that isn't in its parameters, it encounters a problem.

2. **The PhD Paradox: Prefers Being Fluent Over Being Accurate**

<img src="/ai-engineering-intro/assets/image-14.png" alt="image-14.png" width="434" height="289" />

A real doctor knows when to say "I don't know." The LLM, by its very definition as an **Autocomplete** engine, must complete the sentence.

Instead of stopping, the model uses its "doctorate" to predict the token that **appears** most likely and convincing linguistically, even if it's completely wrong factually. The model prefers Fluent Nonsense over silence.


**The skeptical angle:**

This is "the doctor who lies with complete confidence." The danger is not the mistake, but the high level of language (the PhD) that makes the lie sound completely credible. The stronger the model, the harder its hallucinations are to detect.

**Recommendation:**

Don't rely on the LLM as a Single Source of Truth. The LLM is a **synthesis and inference engine**, not a **verification mechanism**. The responsibility for **Validation** and **Peer Review** remains with us.

