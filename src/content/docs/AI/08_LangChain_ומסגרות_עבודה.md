---
title: "LangChain ומסגרות עבודה לבניית אפליקציות AI"
category: AI
part: 8/10
---

## למה צריך מסגרת עבודה (Framework) בכלל?

אפשר לקרוא ל-API של LLM ישירות (כפי שראינו במדריכים הקודמים), אבל כשהאפליקציה גדלה — ניהול שיחות, RAG, agents, ואינטגרציות מרובות — מסגרות עבודה חוסכות המון קוד "בוילרפלייט" ומספקות תבניות מוכחות.

## סקירת המסגרות המרכזיות

### LangChain
המסגרת הפופולרית והוותיקה ביותר. מספקת אבסטרקציות לשרשור (chaining) קריאות LLM, ניהול memory, אינטגרציות עם מאות כלים ומאגרי מידע וקטוריים.

- תיעוד: https://python.langchain.com/docs/introduction/
- GitHub: https://github.com/langchain-ai/langchain

### LangGraph
הרחבה של LangChain, מותאמת במיוחד לבניית **סוכנים מורכבים** עם מבנה גרף (state machine) — מאפשר לוגיקה מסועפת, לולאות, ו-human-in-the-loop.

- תיעוד: https://langchain-ai.github.io/langgraph/

### LlamaIndex
מתמקד בעיקר ב-RAG ואינדוקס מידע — אינטגרציות עשירות למקורות דאטה (PDF, Notion, Slack, מסדי נתונים).

- תיעוד: https://docs.llamaindex.ai/

### Anthropic Agent SDK / Claude Agent SDK
ה-SDK הרשמי של Anthropic לבניית אפליקציות סוכניות עם Claude, כולל תמיכה מובנית ב-MCP, tool use, וניהול context.

- תיעוד: https://docs.claude.com

### Semantic Kernel (מיקרוסופט)
מסגרת בקוד פתוח מבית מיקרוסופט, פופולרית בסביבות .NET ו-Python, עם דגש על אינטגרציה ארגונית.

- תיעוד: https://learn.microsoft.com/semantic-kernel/

## דוגמת קוד — שרשרת פשוטה ב-LangChain (LCEL)

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

model = ChatAnthropic(model="claude-sonnet-4-6")

prompt = ChatPromptTemplate.from_messages([
    ("system", "אתה מתרגם מקצועי מעברית לאנגלית"),
    ("user", "{text}")
])

parser = StrOutputParser()

# שרשור באמצעות LCEL (LangChain Expression Language)
chain = prompt | model | parser

result = chain.invoke({"text": "שלום, מה שלומך?"})
print(result)
```

## דוגמת קוד — בניית סוכן עם LangGraph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    step_count: int

def call_model(state: AgentState):
    # קריאה למודל
    response = model.invoke(state["messages"])
    return {"messages": state["messages"] + [response], "step_count": state["step_count"] + 1}

def should_continue(state: AgentState):
    if state["step_count"] >= 5:
        return "end"
    return "continue"

graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue, {"continue": "agent", "end": END})

app = graph.compile()
result = app.invoke({"messages": [], "step_count": 0})
```

## דוגמת קוד — RAG מהיר עם LlamaIndex

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# טעינת מסמכים מתיקייה
documents = SimpleDirectoryReader("./data").load_data()

# בניית אינדקס וקטורי
index = VectorStoreIndex.from_documents(documents)

# יצירת query engine ושאילתה
query_engine = index.as_query_engine()
response = query_engine.query("מה מדיניות ההחזרות שלנו?")
print(response)
```

## איך בוחרים מסגרת עבודה?

| צורך | המלצה |
|---|---|
| RAG מהיר וקל | LlamaIndex |
| Agents מורכבים עם state מסועף | LangGraph |
| אקוסיסטם רחב, קהילה גדולה, גמישות | LangChain |
| פיתוח מהיר וישיר עם Claude, כולל MCP native | Claude Agent SDK |
| סביבה ארגונית מבוססת .NET/Azure | Semantic Kernel |
| שליטה מלאה, ללא תלות ב-framework | קריאה ישירה ל-API (כפי שראינו במדריכים 2, 7) |

## יתרונות וחסרונות של שימוש ב-framework

**יתרונות:**
- פחות קוד boilerplate.
- אינטגרציות מוכנות (vector DBs, document loaders, כלים).
- קהילה ותיעוד עשיר, פתרון בעיות נפוצות.

**חסרונות:**
- שכבת אבסטרקציה נוספת יכולה להקשות על דיבוג.
- לפעמים "כבד מדי" למשימות פשוטות — עדיף קריאה ישירה ל-API.
- שינויי גרסאות תכופים (במיוחד ב-LangChain) יכולים לשבור קוד קיים.

## סרטוני יוטיוב מומלצים

- LangChain Official Channel — מדריכים רשמיים: https://www.youtube.com/@LangChain
- freeCodeCamp — "LangChain Crash Course": חיפוש "LangChain crash course freeCodeCamp" ביוטיוב
- Sam Witteveen — סרטוני deep-dive על LangChain ו-agents: https://www.youtube.com/@samwitteveenai
- LlamaIndex Official — מדריכי RAG: https://www.youtube.com/@LlamaIndex

## שאלות ראיון עבודה נפוצות

1. **מתי הייתם בוחרים להשתמש ב-framework כמו LangChain, לעומת קריאה ישירה ל-API?**
2. **מה ההבדל בין LangChain ל-LangGraph?** תשובה: LangChain מתמקד בשרשור לינארי (chains) ואינטגרציות; LangGraph מתמקד במבני state-machine מורכבים עם לולאות ותנאים, מתאים במיוחד לסוכנים.
3. **מהם היתרונות והחסרונות של שימוש ב-framework בהשוואה לקוד "vanilla"?**
4. **הסבירו מה זה LCEL ב-LangChain.**
5. **איך הייתם בונים מערכת שמשלבת RAG ו-Agent יחד?**

## טיפים וטריקים

- **אל תתחילו עם framework כבד** — אם הפרויקט קטן, קריאה ישירה ל-API לרוב פשוטה ומהירה יותר לפתח ולתחזק.
- **הקפידו על גרסאות (pinning)** — LangChain במיוחד משנה API בין גרסאות; נעלו גרסה בקובץ requirements.
- **קראו את קוד המקור** כשמשהו לא ברור — לפעמים התיעוד לא מכסה כל מקרה קצה.
- **שקלו לבנות אבסטרקציה דקה משלכם** מעל ה-API הגולמי — לפעמים זה נותן יותר שליטה מ-framework מוכן.

---
*המדריך הבא: מדריך 9 — שאלות ראיון עבודה בתחום ה-AI/LLM*
