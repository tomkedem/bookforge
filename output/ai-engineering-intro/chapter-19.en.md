# LLM Tokens: The Fundamental Units of Language (and the Mechanics Behind Them)

**The Tokenization Process**

Computers, and neural networks in particular, cannot process raw text. For a language model to be able to "read," it must first break down the text into basic computational units called **Tokens.**

As shown in the illustration, the complex word multiculturalism is not read as a single unit. The model breaks it down into four sub-tokens (Sub-words): multi-, -cul-, -tur-, alism.










**Key Points:**

1. **A word is not a token (Word ≠ Token):** The model doesn't see "words." It sees sequences of characters. Very common words (like the) will usually be a single token. Complex, rare, or technical terms (very common in Verint) will be broken down into several tokens.

2. **Text becomes numbers:** This is the critical step. Each token is translated to a unique numerical identifier (ID) from a fixed "dictionary." All the "intelligence" of the model is actually complex statistical computation on these numbers.

3. **Pattern understanding:** Breaking into sub-words allows the model to "understand" new words it never saw during training, or to handle spelling errors (like **Understading** shown in the illustration - missing the letter 'n'). The model recognizes the familiar parts of the word and infers the meaning from context.

<img src="/ai-engineering-intro/assets/image-10.png" alt="image-10.png" width="558" height="272" />

**Constructive skepticism:**

When building architecture for a product, don't compare models only by "answer quality."

**My tip:** Always check the **Tokenization Efficiency**. When you replace a model within the system, you must recalculate the memory limits (Context) and the budget, because your Token Count is going to change.

**Don't assume that 1,000 tokens in GPT are the same 1,000 tokens in Gemini.**
