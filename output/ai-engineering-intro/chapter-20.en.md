# LLM: The "Black Box" of Parameters

We'll talk at a very High Level - we'll get into details in the following lessons.

Let's talk at a high level, and we'll dive into details later.

We're talking about a model composed of many "neurons," where each neuron is essentially a simple mathematical function that receives values, performs a calculation, and passes the result forward.

<img src="/ai-engineering-intro/assets/image-11.jpg" alt="image-11.jpg" width="709" height="346" />

The neurons are connected to each other in a large network, so the result of one affects the others, and together they create a complex calculation that leads to predicting the next token.


**Key Points:**

1. **Scale of Parameters:** Today's elite models use billions and trillions of such nodes to predict the next token.

2. **Inference-time Compute:** The most modern models no longer just "output" an answer. They use internal computation (Reasoning) before giving the answer, a process that can be compared to "turning the dials" inside the box to reach the correct logic.

3. **Architecture efficiency:** The trend today is not just to increase the number of dials, but to make them sparse - meaning the model activates only the dials relevant to the task (for example, only code or only language understanding) to save energy and time.

