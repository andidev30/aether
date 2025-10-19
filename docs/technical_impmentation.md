# 🧠 Aether — AI Audit Engine (Technical Documentation)

## 1. Purpose
Aether is a backend service that evaluates text outputs from Large Language Models (LLMs).  
It measures bias, hallucination, and evidence confidence through multi-model integration.

---

## 2. System Flow Overview

### Step-by-Step Process
1. **Input**
   - The user sends a POST request to `/audit` with raw text (LLM output).

2. **Vertex AI - Embedding & Bias Detection**
   - Text is embedded using the Vertex AI Embedding API.
   - Bias/toxicity is detected using Vertex AI classification.

3. **Elastic Cloud - Evidence Retrieval**
   - Embedding vectors are used to perform hybrid search (BM25 + kNN).
   - Retrieves semantically similar documents from the evidence index.

4. **Scoring Logic**
   - `bias_score` → output from Vertex AI classifier.  
   - `hallucination_score` → inverse of average semantic similarity between text and retrieved evidence.  
   - `source_confidence` → proportion of retrieved docs with similarity above a defined threshold.

5. **Gemini - Reasoning Layer**
   - Consolidates all metrics and evidence.
   - Generates a natural language explanation summarizing the audit result.

6. **Output**
   - Returns JSON response to client.

---

## 3. Architecture Diagram

```mermaid
flowchart TD
    A[User Input / LLM Output] --> B[Audit API (Node.js)]
    B --> C1[Vertex AI Embedding + Bias Detection]
    B --> C2[Elastic Cloud Hybrid Search]
    B --> C3[Gemini Explanation]
    C1 --> D[Aggregator]
    C2 --> D
    C3 --> D
    D --> E[Audit JSON Response]
```

---

## 4. API Design

### POST `/audit`
**Request:**
```json
{
  "text": "AI models are always neutral and unbiased.",
  "model": "gemini-pro"
}
```

**Response:**
```json
{
  "bias_score": 0.72,
  "hallucination_score": 0.55,
  "source_confidence": 0.41,
  "gemini_explanation": "The statement overgeneralizes AI neutrality and lacks supporting evidence."
}
```

---

## 5. Core Modules

| Module | Description |
|---------|--------------|
| **audit.controller.ts** | Handles incoming HTTP requests and orchestrates services. |
| **vertex.service.ts** | Calls Vertex AI Embedding API and bias classifier. |
| **elastic.service.ts** | Sends hybrid search requests to Elastic Cloud and parses similarity scores. |
| **gemini.service.ts** | Uses Gemini API to summarize the audit result in natural language. |
| **score.utils.ts** | Combines raw data into composite scores (bias, hallucination, confidence). |

---

## 6. Scoring Algorithm (Simplified)

```python
bias_score = vertex_bias
similarities = [doc.similarity for doc in elastic_results]

hallucination_score = 1 - (sum(similarities) / len(similarities))
source_confidence = len([s for s in similarities if s > 0.75]) / len(similarities)
```

Each score is normalized between **0–1** before being returned.

---

## 7. Data Flow Summary

| Step | Source | Target | Payload |
|------|---------|---------|----------|
| 1 | User | Node API | Text |
| 2 | Node API | Vertex AI | Embedding request |
| 3 | Node API | Elastic Cloud | Vector query |
| 4 | Elastic Cloud | Node API | Search results (JSON) |
| 5 | Node API | Gemini | JSON with context (scores + evidence) |
| 6 | Gemini | Node API | Explanation string |
| 7 | Node API | User | Final JSON result |

---

## 8. Directory Layout

```
aether/
├── src/
│   ├── controllers/
│   │   └── audit.controller.ts
│   ├── services/
│   │   ├── vertex.service.ts
│   │   ├── elastic.service.ts
│   │   └── gemini.service.ts
│   ├── utils/
│   │   └── score.utils.ts
│   └── index.ts
├── .env
├── package.json
└── README.md
```

---

## 9. Dependencies
- **Node.js 20+**
- **Axios** (HTTP requests)
- **Express.js** (API server)
- **@elastic/elasticsearch** (Elastic Cloud SDK)
- **Google Cloud Vertex AI SDK**
- **Gemini API client**

---

## 10. Example Run Flow (Local Simulation)
```bash
# Run backend
npm run dev

# Test API
curl -X POST http://localhost:3000/audit   -H "Content-Type: application/json"   -d '{"text": "AI never makes mistakes."}'
```

---

## 11. Notes
- Bias detection model can be replaced with any Vertex AI model endpoint.  
- Elastic index should contain verified factual data (Wikipedia, articles, curated datasets).  
- Gemini reasoning layer runs last to provide contextual explanations.
