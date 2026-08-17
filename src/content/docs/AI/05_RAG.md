---
title: "RAG — Retrieval Augmented Generation"
category: AI
part: 5/10
---

## מהו RAG?

RAG (יצירה מועשרת באחזור) הוא ארכיטקטורה שמשלבת בין **אחזור מידע** (Retrieval) לבין **יצירת טקסט** (Generation) על ידי LLM. הרעיון: במקום לסמוך רק על הידע ה"קפוא" שהמודל למד באימון, המערכת מאחזרת מידע רלוונטי ועדכני ממאגר חיצוני (מסמכים, מסד נתונים, אינטרנט) ומזינה אותו כהקשר (context) לפרומפט לפני שהמודל עונה.

## למה צריך RAG?

1. **מידע עדכני** — למודלים יש נקודת חיתוך ידע (knowledge cutoff); RAG מאפשר גישה למידע חדש.
2. **מידע פרטי/פנימי** — מסמכי חברה, מדיניות פנימית, נתוני לקוחות — דברים שהמודל מעולם לא ראה.
3. **הפחתת הזיות (Hallucinations)** — כשהמודל "מבסס" תשובות על מקורות אמיתיים, הסיכוי להמצאת עובדות יורד.
4. **שקיפות ומעקב מקורות** — ניתן לצטט בדיוק מאיפה הגיע כל פרט מידע.
5. **חסכוני יותר מ-Fine-tuning** — אין צורך לאמן מחדש את המודל כשהמידע מתעדכן; פשוט מעדכנים את מאגר הנתונים.

## איך RAG עובד — שלב אחר שלב

```
שאלת משתמש
    │
    ▼
1. המרת השאלה לוקטור (embedding)
    │
    ▼
2. חיפוש דמיון (similarity search) במאגר וקטורי
    │
    ▼
3. אחזור המסמכים/קטעים הרלוונטיים ביותר (Top-K)
    │
    ▼
4. הזרקת המסמכים כהקשר לתוך הפרומפט
    │
    ▼
5. LLM מייצר תשובה מבוססת על ההקשר שסופק
```

## דוגמת קוד — RAG בסיסי עם Python

```python
from sentence_transformers import SentenceTransformer
import numpy as np

# שלב 1: יצירת embeddings למסמכים
model = SentenceTransformer('all-MiniLM-L6-v2')

documents = [
    "מדיניות ההחזרות שלנו מאפשרת החזר כספי תוך 30 יום מיום הרכישה.",
    "משלוח חינם ניתן להזמנות מעל 200 ש\"ח.",
    "שעות הפעילות של שירות הלקוחות הן א'-ה' 9:00-18:00.",
]

doc_embeddings = model.encode(documents)

# שלב 2: שאלת המשתמש
query = "כמה זמן יש לי להחזיר מוצר?"
query_embedding = model.encode([query])[0]

# שלב 3: חישוב דמיון קוסינוס ומציאת המסמך הכי רלוונטי
similarities = np.dot(doc_embeddings, query_embedding) / (
    np.linalg.norm(doc_embeddings, axis=1) * np.linalg.norm(query_embedding)
)
best_match_idx = np.argmax(similarities)
relevant_doc = documents[best_match_idx]

# שלב 4: בניית פרומפט עם ההקשר
prompt = f"""ענה על השאלה בהתבסס על ההקשר הבא בלבד:

הקשר: {relevant_doc}

שאלה: {query}
"""
print(prompt)
```

## דוגמת קוד — RAG עם LangChain ו-Vector Store

```python
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

# טעינת מסמך ופיצול לקטעים
loader = TextLoader("company_policy.txt")
documents = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# יצירת מאגר וקטורי
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# בניית שרשרת RAG
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
)

result = qa_chain.invoke("מהי מדיניות ההחזרות?")
print(result["result"])
```

## רכיבים מרכזיים במערכת RAG מקצועית

| רכיב | תפקיד | דוגמאות כלים |
|---|---|---|
| Document Loader | טעינת מסמכים ממקורות שונים | PDF, HTML, Notion, Google Docs |
| Text Splitter | פיצול מסמכים ל-chunks | Recursive, Semantic Chunking |
| Embedding Model | המרת טקסט לווקטורים | OpenAI Embeddings, Cohere, BGE |
| Vector Database | אחסון וחיפוש וקטורים | Pinecone, Chroma, Weaviate, Qdrant, pgvector |
| Retriever | לוגיקת אחזור (semantic, hybrid, re-ranking) | BM25 + Vector Hybrid Search |
| Re-ranker | דירוג מחדש של תוצאות לפי רלוונטיות | Cohere Rerank, Cross-Encoders |
| LLM | יצירת התשובה הסופית | Claude, GPT, Gemini |

## טכניקות RAG מתקדמות

- **Hybrid Search** — שילוב חיפוש סמנטי (embeddings) עם חיפוש מילות מפתח קלאסי (BM25) לתוצאות מדויקות יותר.
- **Re-ranking** — לאחר אחזור ראשוני של מועמדים, מודל נוסף מדרג אותם מחדש לפי רלוונטיות מדויקת יותר.
- **Query Expansion / Rewriting** — שכתוב שאלת המשתמש למספר ניסוחים כדי לשפר סיכויי אחזור.
- **Chunking חכם** — פיצול מסמכים לפי מבנה סמנטי (פסקאות, כותרות) ולא לפי אורך קבוע בלבד.
- **Agentic RAG** — סוכן AI שמחליט דינמית מתי ואיך לאחזר מידע, ואף מבצע מספר סבבי אחזור.

## סרטוני יוטיוב מומלצים

- IBM Technology — "What is Retrieval-Augmented Generation (RAG)?": חיפוש "IBM RAG explained" ביוטיוב
- LangChain Official — סדרת מדריכי RAG מעשיים: https://www.youtube.com/@LangChain
- freeCodeCamp — "RAG from Scratch" קורס מלא: חיפוש "RAG from scratch freeCodeCamp" ביוטיוב
- Pinecone — "Vector Databases and RAG Explained": https://www.youtube.com/@pinecone-io

## תיעוד רשמי מומלץ

- LangChain RAG Docs: https://python.langchain.com/docs/tutorials/rag/
- Pinecone Learning Center: https://www.pinecone.io/learn/retrieval-augmented-generation/
- Anthropic — Contextual Retrieval: https://www.anthropic.com/news/contextual-retrieval
- LlamaIndex Docs: https://docs.llamaindex.ai/

## שאלות ראיון עבודה נפוצות

1. **מהו RAG ומדוע הוא עדיף על Fine-tuning במקרים מסוימים?**
2. **מהם השלבים העיקריים בבניית pipeline של RAG?**
3. **מה ההבדל בין Semantic Search ל-Hybrid Search?** תשובה: Semantic מבוסס embeddings בלבד; Hybrid משלב זאת עם BM25/keyword search לכיסוי טוב יותר של מונחים מדויקים (שמות, מספרים).
4. **מהו Chunking וכיצד גודל ה-chunk משפיע על ביצועי המערכת?** chunks קטנים מדי מאבדים הקשר; גדולים מדי "מדללים" רלוונטיות.
5. **כיצד הייתם מודדים את איכות מערכת RAG?** מדדים: Recall@K, Precision, Faithfulness (עד כמה התשובה נאמנה למקורות), Answer Relevancy.
6. **מהו Re-ranking ולמה הוא משפר תוצאות?**

## טיפים וטריקים

- **אל תסתפקו רק ב-Top-1** — אחזרו כמה מועמדים (Top-K) ותנו למודל לסנן את הרלוונטי.
- **הוסיפו metadata לכל chunk** (מקור, תאריך, כותרת) — עוזר גם לסינון וגם לציטוט מקורות.
- **בדקו overlap בין chunks** — חפיפה קטנה (10-20%) מונעת "חיתוך" משפטים חשובים.
- **נטרו Faithfulness** — ודאו שהתשובות באמת מבוססות על ההקשר שסופק ולא "מדמיינות" מעבר לו.
- **שקלו Contextual Retrieval** — הוספת הקשר קצר לכל chunk לפני יצירת ה-embedding, כדי לשפר משמעותית את דיוק האחזור.

---
*המדריך הבא: מדריך 6 — Fine-Tuning ואימון מודלים מותאמים אישית*
