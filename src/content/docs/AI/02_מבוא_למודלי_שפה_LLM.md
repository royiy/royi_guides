---
title: "מבוא למודלי שפה גדולים (LLM — Large Language Models)"
category: AI
part: 2/10
---

## מהו LLM?

LLM (מודל שפה גדול) הוא רשת נוירונים ענקית, מבוססת ארכיטקטורת **Transformer**, שאומנה על כמויות עצומות של טקסט (טריליוני מילים) במטרה ללמוד לחזות את המילה/הטוקן (token) הבא ברצף. מתוך המשימה הפשוטה הזו — "נחש מה בא אחר כך" — מתפתחות יכולות מפתיעות: כתיבה, תרגום, קוד, הסקה לוגית, ואפילו יכולות שנקראות "Emergent Abilities" שלא תוכננו במפורש.

## איך זה עובד? — הבסיס הטכני

### 1. Tokenization
לפני שהמודל "רואה" טקסט, הוא מפרק אותו ל-**טוקנים** — יחידות קטנות (מילים, חלקי מילים, או תווים). לדוגמה המילה "התחברות" עשויה להתפרק ל-"הת" + "חבר" + "ות".

```python
# דוגמה עם ספריית tiktoken (OpenAI)
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
tokens = enc.encode("שלום עולם, איך הולך?")
print(tokens)
print(enc.decode(tokens))
```

### 2. Embeddings
כל טוקן הופך לוקטור מספרים (embedding) שמייצג את "המשמעות" שלו במרחב רב-ממדי.

### 3. Self-Attention — הלב של ה-Transformer
המנגנון המרכזי שמאפשר למודל "להסתכל" על כל הטוקנים ברצף ולהחליט אילו מהם רלוונטיים לחיזוי הבא. זה מה שמאפשר להבין הקשר (context) ארוך טווח.

### 4. שכבות (Layers) רבות
מודלים גדולים כמו GPT-4 או Claude מכילים עשרות עד מאות שכבות Transformer, עם מיליארדי עד טריליוני פרמטרים.

## תהליך האימון — שלושה שלבים עיקריים

1. **Pre-training** — אימון על טקסט עצום מהאינטרנט, ספרים, קוד וכו', במטרה לחזות את המילה הבאה. שלב יקר מאוד (מיליוני דולרים, אלפי GPUs).
2. **Supervised Fine-Tuning (SFT)** — אימון נוסף על דוגמאות שיחה איכותיות שנכתבו ע"י בני אדם, כדי ללמד את המודל "להתנהג" כעוזר.
3. **RLHF / RLAIF** (Reinforcement Learning from Human/AI Feedback) — כיוונון נוסף לפי העדפות אנוש (או AI) כדי להפוך את התשובות למועילות, בטוחות ומדויקות יותר.

## דוגמת שימוש ב-API — קריאה ל-Claude

```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "הסבר לי מה זה Attention Mechanism במשפט אחד"}
    ]
)

print(message.content[0].text)
```

## דוגמת שימוש ב-API — קריאה ל-OpenAI

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "כתוב לי פונקציה בפייתון שממיינת רשימה"}
    ]
)

print(response.choices[0].message.content)
```

## מושגים חשובים

| מושג | הסבר |
|---|---|
| Context Window | כמות הטוקנים המקסימלית שהמודל "זוכר" בשיחה אחת |
| Temperature | פרמטר ששולט ברמת האקראיות/יצירתיות של התשובה (0 = דטרמיניסטי, 1+ = יצירתי יותר) |
| Top-p / Top-k | שיטות דגימה שמגבילות מאיזה מאגר מילים המודל בוחר את הטוקן הבא |
| Hallucination | כאשר המודל "ממציא" עובדות שאינן נכונות בביטחון מלא |
| Fine-tuning | אימון נוסף של מודל קיים על דאטה ספציפי לתחום |
| Few-shot Learning | מתן דוגמאות בתוך הפרומפט כדי לכוון את התנהגות המודל |
| Multimodal | מודל שמסוגל לעבד גם טקסט, גם תמונה, ולעיתים גם קול/וידאו |

## המודלים המרכזיים בשוק (נכון ל-2026)

- **Anthropic Claude** — משפחת Claude (Sonnet, Opus, Haiku, וכעת גם Mythos/Fable) — https://docs.claude.com
- **OpenAI GPT** — משפחת GPT-4o, o-series למודלי reasoning — https://platform.openai.com/docs
- **Google Gemini** — https://ai.google.dev/gemini-api/docs
- **Meta Llama** — מודלים בקוד פתוח — https://llama.meta.com/
- **Mistral** — מודלים אירופאיים, חלקם open-source — https://docs.mistral.ai/

## סרטוני יוטיוב מומלצים

- Andrej Karpathy — "Let's build GPT: from scratch, in code, spelled out": https://www.youtube.com/watch?v=kCc8FmEb1nY
- Andrej Karpathy — "Intro to Large Language Models": https://www.youtube.com/watch?v=zjkBMFhNj_g
- 3Blue1Brown — "Attention in transformers, visually explained": https://www.youtube.com/watch?v=eMlx5fFNoYc
- StatQuest — "Transformer Neural Networks, ChatGPT's foundation, Clearly Explained": https://www.youtube.com/watch?v=zxQyTK8quyY

## שאלות ראיון עבודה נפוצות (LLM)

1. **מה ההבדל בין Encoder, Decoder ו-Encoder-Decoder Transformer?** GPT הוא decoder-only, BERT הוא encoder-only, T5 הוא encoder-decoder.
2. **הסבירו את מנגנון ה-Self-Attention בקצרה.** כל טוקן "שואל" שאלה (Query), ומשווה אותה למפתחות (Keys) של כל שאר הטוקנים כדי לחשב משקלים (attention scores), ולאחר מכן ממצע ערכים (Values) לפי המשקלים.
3. **מהי בעיית ה-Hallucination וכיצד ניתן להפחית אותה?** תשובות: RAG, grounding בעובדות חיצוניות, ציטוט מקורות, fine-tuning על דאטה עובדתי, ובקשת "אני לא יודע" כשמתאים.
4. **מה ההבדל בין Fine-tuning ל-Prompt Engineering ל-RAG?** שלוש דרכים שונות "להתאים" מודל למשימה, בעלויות ומורכבות שונות.
5. **מהו Context Window ומה קורה כשחורגים ממנו?**
6. **מה זה Temperature ואיך הוא משפיע על הפלט?**

## טיפים וטריקים

- **תמיד בדקו את ה-Context Window** של המודל שאתם עובדים איתו — שיחות ארוכות מדי "ישכחו" מידע ישן.
- **Temperature נמוך (0-0.3)** למשימות שדורשות דיוק (קוד, עובדות), **גבוה (0.7-1)** למשימות יצירתיות.
- **פרקו משימות מורכבות לשלבים** (Chain of Thought) — מודלים מבצעים טוב יותר כשהם "חושבים בקול".
- **אל תסמכו עיוורת על תשובות עובדתיות** — תמיד אמתו נתונים קריטיים במקור חיצוני.

## מקורות נוספים

- Anthropic — "Building with Claude": https://docs.claude.com
- OpenAI Cookbook: https://cookbook.openai.com/
- "Attention Is All You Need" (המאמר המקורי): https://arxiv.org/abs/1706.03762
- Hugging Face — LLM Course: https://huggingface.co/learn/llm-course

---
*המדריך הבא: מדריך 3 — הנדסת פרומפטים (Prompt Engineering)*
