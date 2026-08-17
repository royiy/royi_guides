---
title: "AI Agents — סוכני בינה מלאכותית"
category: AI
part: 7/10
---

## מהו AI Agent?

סוכן AI (AI Agent) הוא מערכת שבה LLM לא רק עונה על שאלה בסבב יחיד, אלא **פועל באופן אוטונומי (או חצי-אוטונומי)** כדי להשיג מטרה: הוא מתכנן, משתמש בכלים (tools), בוחן תוצאות, ומחליט על הצעד הבא — לרוב במעגל חוזר עד שהמשימה הושלמה.

ההבדל המרכזי מ"צ'אטבוט רגיל": צ'אטבוט עונה תשובה אחת; **סוכן** יכול לבצע רצף פעולות: לחפש מידע, לכתוב קוד, להריץ אותו, לבדוק את התוצאה, לתקן טעויות, ולחזור על התהליך — הכל בלי התערבות אנושית בכל שלב.

## מרכיבי ליבה של סוכן AI

1. **Planning (תכנון)** — פירוק המשימה הכוללת לצעדים קטנים.
2. **Tool Use (שימוש בכלים)** — קריאה ל-APIs, הרצת קוד, חיפוש באינטרנט, שאילתות DB.
3. **Memory (זיכרון)** — שמירת הקשר לאורך זמן: זיכרון קצר-טווח (השיחה הנוכחית) וזיכרון ארוך-טווח (מידע שנשמר בין הרצות).
4. **Reflection (רפלקציה)** — הערכה עצמית של איכות התוצאה, ותיקון טעויות.

## דפוס ReAct — Reason + Act

אחד הדפוסים המוכרים ביותר לבניית סוכנים. המודל מתריע בין "חשיבה" (Reasoning) לבין "פעולה" (Action) במעגל חוזר:

```
Thought: אני צריך למצוא את מזג האוויר בתל אביב לפני שאענה
Action: get_weather(city="תל אביב")
Observation: 28 מעלות, בהיר
Thought: עכשיו יש לי את המידע הדרוש כדי לענות
Final Answer: מזג האוויר בתל אביב היום הוא 28 מעלות ובהיר.
```

## דוגמת קוד — סוכן בסיסי עם Tool Use (Anthropic API)

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_weather",
        "description": "מחזיר את מזג האוויר הנוכחי עבור עיר נתונה",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "שם העיר"}
            },
            "required": ["city"]
        }
    }
]

messages = [{"role": "user", "content": "מה מזג האוויר בתל אביב?"}]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# בדיקה אם המודל רוצה להשתמש בכלי
if response.stop_reason == "tool_use":
    tool_use = next(block for block in response.content if block.type == "tool_use")
    city = tool_use.input["city"]

    # כאן הייתה קריאה אמיתית ל-API של מזג אוויר
    weather_result = f"28 מעלות, בהיר ב-{city}"

    # שליחת תוצאת הכלי בחזרה למודל
    messages.append({"role": "assistant", "content": response.content})
    messages.append({
        "role": "user",
        "content": [{
            "type": "tool_result",
            "tool_use_id": tool_use.id,
            "content": weather_result
        }]
    })

    final_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )
    print(final_response.content[0].text)
```

## דוגמת קוד — לולאת סוכן (Agent Loop) בסיסית

```python
def run_agent(user_query, max_iterations=5):
    messages = [{"role": "user", "content": user_query}]

    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        if response.stop_reason != "tool_use":
            # הסוכן סיים - זו התשובה הסופית
            return response.content[0].text

        # ביצוע הכלי וחזרה ללולאה
        tool_use = next(b for b in response.content if b.type == "tool_use")
        result = execute_tool(tool_use.name, tool_use.input)  # פונקציה משלכם

        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{"type": "tool_result", "tool_use_id": tool_use.id, "content": str(result)}]
        })

    return "הגעתי למספר המקסימלי של איטרציות"
```

## ארכיטקטורות סוכנים נפוצות

| ארכיטקטורה | הסבר | מתי מתאים |
|---|---|---|
| Single Agent | סוכן אחד עם סט כלים | משימות ממוקדות ופשוטות יחסית |
| Multi-Agent (Orchestrator-Worker) | סוכן "מנהל" מפזר משימות לסוכני-משנה מומחים | משימות מורכבות שניתנות לפירוק |
| Multi-Agent (Debate/Consensus) | כמה סוכנים "מתווכחים" כדי להגיע למסקנה טובה יותר | משימות שדורשות בדיקת איכות גבוהה |
| Human-in-the-loop | סוכן עוצר לאישור אנושי בצמתים קריטיים | פעולות בעלות סיכון (תשלומים, שליחת מיילים) |

## אתגרים מרכזיים בבניית סוכנים

- **לולאות אינסופיות** — סוכן שלא מצליח להתקדם וחוזר על אותה פעולה. פתרון: הגבלת max_iterations, זיהוי דפוסים חוזרים.
- **עלויות** — כל צעד הוא קריאת API נוספת; סוכנים מורכבים יכולים להיות יקרים.
- **אמינות** — טעות בשלב מוקדם עלולה "להתגלגל" ולהשפיע על כל השרשרת.
- **בטיחות** — סוכן עם יכולת לבצע פעולות אמיתיות (תשלום, מחיקת קבצים) דורש עצירות ואישורים.

## סרטוני יוטיוב מומלצים

- Anthropic — "Building Effective Agents": חיפוש בערוץ Anthropic הרשמי ביוטיוב
- Andrej Karpathy — הרצאות על אבולוציית ה-Agentic AI: https://www.youtube.com/@AndrejKarpathy
- LangChain — סדרת מדריכים על בניית agents: https://www.youtube.com/@LangChain
- David Ondrej — סרטוני בנייה מעשית של AI Agents: https://www.youtube.com/@DavidOndrej1

## תיעוד רשמי מומלץ

- Anthropic — "Building Effective Agents": https://www.anthropic.com/research/building-effective-agents
- Anthropic — Agent SDK Docs: https://docs.claude.com
- LangGraph (framework לבניית סוכנים): https://langchain-ai.github.io/langgraph/
- OpenAI — Agents SDK: https://platform.openai.com/docs/guides/agents

## שאלות ראיון עבודה נפוצות

1. **מה ההבדל בין Chatbot רגיל לבין AI Agent?**
2. **הסבירו את דפוס ReAct.**
3. **כיצד הייתם מונעים מסוכן להיכנס ללולאה אינסופית?**
4. **מה היתרונות והחסרונות של ארכיטקטורת Multi-Agent לעומת Single Agent?**
5. **כיצד הייתם מתכננים מנגנון "human-in-the-loop" לסוכן שמבצע פעולות רגישות (כמו תשלומים)?**
6. **מהם האתגרים בהערכת (evaluation) ביצועי סוכן AI, בהשוואה למודל LLM רגיל?**

## טיפים וטריקים

- **התחילו פשוט** — סוכן single-agent עם 2-3 כלים ברורים, לפני שעוברים למערכת multi-agent מורכבת.
- **הגבילו איטרציות** — תמיד קבעו max_iterations כדי למנוע ריצות אינסופיות ועלויות בלתי צפויות.
- **תעדו tools בבירור** — תיאור טוב של כלי משפר דרמטית את יכולת הבחירה הנכונה של הסוכן.
- **הוסיפו לוגים מפורטים** — כשסוכן "לא עובד כמו שצריך", לוג מפורט של כל שלב הוא חיוני לדיבוג.
- **שקלו Rate Limiting ו-Budget Caps** — כדי למנוע מסוכן "משתולל" לגרום לעלויות גבוהות.

---
*המדריך הבא: מדריך 8 — LangChain ומסגרות עבודה לבניית אפליקציות AI*
