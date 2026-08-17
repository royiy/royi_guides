---
title: "מבוא ל-MCP (Model Context Protocol)"
category: AI
part: 4/10
---

## מה זה MCP?

**Model Context Protocol (MCP)** הוא פרוטוקול פתוח (open standard) שפותח על ידי Anthropic והושק בנובמבר 2024, שמטרתו לתקנן את הדרך שבה מודלי שפה (LLM) ואפליקציות AI מתחברים למקורות מידע חיצוניים וכלים (tools) — קבצים, מסדי נתונים, APIs, שירותים עסקיים ועוד.

<cite index="3-1">MCP הוא תקן קוד פתוח לחיבור אפליקציות AI למערכות חיצוניות</cite>, כך שאפליקציות AI כמו Claude יכולות להתחבר למקורות מידע (כמו קבצים מקומיים או מסדי נתונים), לכלים (כמו מנועי חיפוש או מחשבונים), ולתהליכי עבודה (כמו פרומפטים מותאמים אישית).

## הבעיה ש-MCP פותר

לפני MCP, כל אינטגרציה בין LLM לכלי חיצוני הייתה דורשת קוד מותאם אישית. אם היו לכם 5 מודלים ו-10 כלים, הייתם צריכים לבנות 50 אינטגרציות שונות (בעיית N×M). Anthropic מכנה זאת <cite index="5-1">"בעיית האינטגרציה N×M"</cite> — ריבוי חיבורים ייחודיים שקשה לתחזק.

MCP הופך את זה למודל **M+N**: כל כלי בונה שרת MCP אחד, וכל אפליקציית AI בונה client MCP אחד — וכולם מדברים באותה "שפה". <cite index="3-1">אפשר לחשוב על MCP כמו USB-C עבור אפליקציות AI — בדיוק כמו ש-USB-C מספק דרך מתוקננת לחבר מכשירים אלקטרוניים, כך MCP מספק דרך מתוקננת לחבר אפליקציות AI למערכות חיצוניות</cite>.

## ארכיטקטורת MCP — שלושה רכיבים עיקריים

1. **MCP Host** — האפליקציה שבה המשתמש עובד (למשל Claude Desktop, Claude Code, IDE).
2. **MCP Client** — הרכיב בתוך ה-Host שמתקשר עם שרתי MCP (יחס 1:1 מול כל שרת).
3. **MCP Server** — תהליך חיצוני שחושף יכולות ספציפיות: **Tools** (פעולות שהמודל יכול להפעיל), **Resources** (מידע שהמודל יכול לקרוא), ו-**Prompts** (תבניות פרומפט מוכנות מראש).

התקשורת מתבצעת באמצעות פרוטוקול **JSON-RPC 2.0**, בדרך כלל דרך STDIO (לשרתים מקומיים) או HTTP/SSE (לשרתים מרוחקים).

## דוגמת קוד — בניית שרת MCP פשוט בפייתון

```python
from mcp.server.fastmcp import FastMCP

# יצירת שרת MCP חדש
mcp = FastMCP("weather-server")

@mcp.tool()
def get_weather(city: str) -> str:
    """מחזיר תחזית מזג אוויר עבור עיר נתונה"""
    # כאן הייתה קריאה אמיתית ל-API של מזג אוויר
    return f"מזג האוויר ב-{city}: 28 מעלות, בהיר"

@mcp.resource("config://settings")
def get_settings() -> str:
    """חושף הגדרות תצורה כמשאב"""
    return "temperature_unit=celsius"

if __name__ == "__main__":
    mcp.run()
```

## דוגמת קוד — בניית שרת MCP ב-TypeScript

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "calculator-server",
  version: "1.0.0",
});

server.tool(
  "add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `התוצאה היא: ${a + b}` }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## הגדרת שרת MCP בקובץ קונפיגורציה (Claude Desktop / Claude Code)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/documents"]
    },
    "weather": {
      "command": "python",
      "args": ["weather_server.py"]
    }
  }
}
```

## מושגי יסוד ב-MCP

| מושג | הסבר |
|---|---|
| Tools | פעולות שהמודל יכול להפעיל (למשל שליחת מייל, שאילתת DB) |
| Resources | נתונים שהמודל יכול לקרוא (קבצים, רשומות DB, תוצאות API) |
| Prompts | תבניות פרומפט מוכנות מראש שהשרת חושף למשתמש |
| Sampling | יכולת של שרת MCP "לבקש" מהמודל שיחזיר תשובה (הפוך מהזרימה הרגילה) |
| Transport | שכבת התעבורה — STDIO למקומי, HTTP/SSE Streamable HTTP למרוחק |
| Elicitation | יכולת של שרת לבקש מידע נוסף מהמשתמש באמצע ריצה |

## MCP מול אלטרנטיבות אחרות

- **MCP מול Function Calling רגיל**: Function Calling (כמו ב-OpenAI) הוא מנגנון ספציפי-למודל שבו מגדירים כלים בתוך קריאת ה-API. MCP הוא פרוטוקול חיצוני, אגנוסטי-למודל, שמאפשר שימוש חוזר באותו שרת מול מודלים וכלים שונים.
- **MCP מול פלאגינים קנייניים**: בעבר כל ספק AI בנה מערכת plugins משלו. MCP הוא תקן פתוח שאומץ כבר <cite index="5-1">על ידי ספקי AI מרכזיים, כולל OpenAI ו-Google DeepMind</cite>, מה שהופך אותו לאינטרופרבילי בין מערכות שונות.

## סרטוני יוטיוב מומלצים

- Anthropic Official — "Model Context Protocol (MCP) Explained": חפשו בערוץ Anthropic ביוטיוב
- Fireship — "MCP in 100 seconds": חיפוש "Fireship MCP" ביוטיוב לסיכום מהיר וקולע
- AI Jason — סדרת סרטונים על בניית שרתי MCP מעשיים: https://www.youtube.com/@AIJasonZ
- Matt Wolfe — הסברים ודמואים על MCP: https://www.youtube.com/@mreflow

## תיעוד רשמי

- אתר MCP הרשמי: https://modelcontextprotocol.io
- מפרט הפרוטוקול המלא: https://modelcontextprotocol.io/docs/getting-started/intro
- GitHub הרשמי (SDKs בכל השפות): https://github.com/modelcontextprotocol
- הכרזת Anthropic המקורית: https://www.anthropic.com/news/model-context-protocol
- מרשם שרתי MCP רשמי: https://registry.modelcontextprotocol.io/docs

## שאלות ראיון עבודה נפוצות

1. **מה זה MCP ולמה הוא נחוץ?** תשובה טובה תתייחס לבעיית ה-N×M ולפתרון המתוקנן.
2. **מה ההבדל בין MCP Tools, Resources, ו-Prompts?**
3. **איזה טרנספורט (transport) הייתם בוחרים לשרת MCP מקומי לעומת שרת מרוחק, ולמה?** (STDIO למקומי; HTTP/SSE למרוחק)
4. **כיצד MCP שונה מ-Function Calling רגיל של OpenAI/Anthropic?**
5. **מהם סיכוני האבטחה הפוטנציאליים בשימוש בשרתי MCP צד-שלישי, וכיצד ניתן להפחית אותם?** נושאים לגעת בהם: אמון בשרת, הרשאות (permissions), Prompt Injection דרך תוכן שמוחזר מהשרת, וניהול credentials.

## טיפים וטריקים

- **התחילו משרתי MCP קיימים** מהמרשם הרשמי לפני שבונים שרת חדש משלכם — ייתכן שהפתרון כבר קיים.
- **הגבילו הרשאות** — תנו לשרת MCP גישה למינימום הנדרש בלבד (למשל תיקייה ספציפית, לא כל מערכת הקבצים).
- **בדקו את מקור השרת** — שרתי MCP הם קוד שרץ במכונה שלכם; התקינו רק ממקורות מהימנים.
- **נצלו FastMCP (פייתון) או ה-SDK הרשמי ל-TypeScript** לפיתוח מהיר — הם מטפלים ברוב ה-boilerplate של הפרוטוקול.
- **תעדו כל tool בבירור** — התיאור (description) של כל tool הוא מה שהמודל "רואה" כדי להחליט מתי להשתמש בו.

---
*המדריך הבא: מדריך 5 — RAG (Retrieval Augmented Generation)*
