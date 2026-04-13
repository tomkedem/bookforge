# RAG (Retrieval-Augmented Generation)

This concept takes "context engineering" and focuses on its most central technique today. If the context window is the workbench, RAG is the librarian who brings the exact book from the organization's giant library to the table.


**The main components:**

• **Connection to trusted external knowledge:** Breaking the limitation of "frozen knowledge" from model training. The LLM gets access to information sources that are the organization's Truth Source.

• **Reduction of Hallucinations:** Using real information as the basis for the answer instead of the model's statistical guesses.

• **Integration of search and inference:** Merging of two worlds - the ability to find information and the ability to understand and explain it (Reasoning).

• **Ideal for organizational and private data:** The perfect solution for working with sensitive documents (Enterprise) that can't or shouldn't be exposed to the model in a retraining process.

<img src="/ai-engineering-intro/assets/image-22.png" alt="image-22.png" width="551" height="321" />

• **Real-time updated responses:** The ability to answer questions about things that happened an hour ago, not just two years ago.

**Constructive skepticism:**

The illustration presents a very optimistic picture, but as experienced programmers, we must look at the "fine print":

1. **Grounded Hallucinations:** RAG doesn't eliminate hallucinations, it just changes their nature. If the system retrieves an irrelevant piece of information, the model will forcefully try to "weld" it to the answer, which creates a lie that looks very credible because it's based on "facts."

2. **The Trusted Knowledge Illusion:** The system is only as reliable as the data in the vector database. If the organizational data is messy, contradictory, or outdated, RAG will only amplify the problem.

3. **Up-to-date is not automatic:** The ability to answer in real-time depends entirely on the Indexing Pipeline. If the data in the Vector DB doesn't update frequently, the system will still live in the past.

