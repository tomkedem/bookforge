# RAG Architecture

This is the "execution" illustration. It takes the abstract concepts and presents the practical work plan of the system. The central role here is of the Framework, acting as the conductor of the entire orchestra.
<img src="/ai-engineering-intro/assets/image-22.png" alt="image-22.png" width="551" height="321" />

**The main components:**

• **Client:** The man icon with the star. The endpoint where the raw question is asked ("Question").

• **Framework:** The AI CPU icon in the center. This is the operational brain. It manages the traffic between all components: receives the question, manages the search, builds the final prompt, and sends it to the LLM.

• **LLM:** The brain icon on the right side. The final station that receives the enriched prompt and generates the answer. Note the arrow returning to the Framework with the caption "Post Processing."

• **Vector Database:** A repository of vectors (embeddings) that enables search by mathematical similarity between text representations. Used to perform Semantic Search through vector proximity calculation.

• **Content (Original + New):** The component list icon at the bottom-right. The raw sources that go through a "vectorization" process (by the Framework) before they can be searched.

**Professional analysis and constructive skepticism:** This architecture clearly shows the importance of the Framework as the connecting factor. But as programmers, we must look at the potential failure points in this diagram:



1. **Bottlenecks (Latency):** Every arrow in the diagram represents a Network Call. Search in Vector DB, sending the prompt to LLM, and processing data in the Framework. All these accumulate to response time that may be too slow for the user.

2. **Semantic Search is not magic:** Semantic search may return results that look similar linguistically but are not relevant to the task.

3. **Post Processing:** The diagram shows a Post Processing step. As programmers, we must know what logic is hiding there. If it's too aggressive, we might lose the precision the LLM tried to produce.

**Important to emphasize:**

If the previous slides were the "what," this is the "how." Note the Framework in the center. It doesn't just pass messages, it's the Orchestrator. It's the one that performs Semantic Search, receives the data, builds the final prompt, and sends it to the LLM. As programmers, most of our work focuses on these connection lines. We don't build the LLM, we build the system that surrounds it and feeds it.


