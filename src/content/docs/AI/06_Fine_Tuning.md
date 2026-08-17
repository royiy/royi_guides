---
title: "Fine-Tuning — אימון מודלים מותאמים אישית"
category: AI
part: 6/10
---

## מהו Fine-Tuning?

Fine-tuning (כיוונון עדין) הוא תהליך של המשך אימון מודל שכבר קיים ומאומן מראש (pretrained), על דאטה-סט ממוקד וקטן יחסית, במטרה להתאים אותו למשימה, לתחום, או לסגנון ספציפי. במקום לאמן מודל מאפס (שדורש משאבים עצומים), אנחנו "מנצלים" את הידע הכללי שהמודל כבר רכש ומכוונים אותו.

## מתי כדאי לעשות Fine-Tuning (ומתי לא)?

**כדאי כאשר:**
- יש לכם משימה חוזרת עם פורמט קבוע (סיווג, חילוץ מידע במבנה ספציפי).
- אתם צריכים סגנון/טון עקבי מאוד (מותג, שפה משפטית).
- Prompt Engineering ו-RAG לא מספיקים לרמת הדיוק הנדרשת.
- יש לכם דאטה-סט איכותי בגודל משמעותי (לרוב לפחות כמה מאות עד אלפי דוגמאות).

**עדיף להימנע/לדחות כאשר:**
- הבעיה היא חוסר מידע עדכני → **RAG** מתאים יותר.
- הצורך הוא רק כיוון סגנוני קל → **Prompt Engineering** מספיק וזול הרבה יותר.
- אין לכם דאטה איכותי ומספק.
- הדרישות משתנות תדיר → מודל מכוונן דורש אימון מחדש בכל שינוי.

## סוגי Fine-Tuning

| שיטה | הסבר |
|---|---|
| Full Fine-tuning | עדכון כל הפרמטרים של המודל — יקר, דורש הרבה זיכרון GPU |
| **LoRA** (Low-Rank Adaptation) | מוסיפים מטריצות קטנות "ניתנות אימון" לצד המשקלים הקפואים — יעיל בהרבה |
| **QLoRA** | LoRA בשילוב קוונטיזציה (quantization) — מאפשר fine-tuning על GPU יחיד |
| Instruction Tuning | אימון על זוגות הוראה-תשובה כדי לשפר יכולת "לציית" להוראות |
| RLHF / DPO | כיוונון לפי העדפות אנוש — משפר איכות ובטיחות תשובות |

## דוגמת קוד — Fine-Tuning עם LoRA (Hugging Face + PEFT)

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
from datasets import load_dataset

model_name = "meta-llama/Llama-3.2-3B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# הגדרת LoRA
lora_config = LoraConfig(
    r=16,                     # דרגת המטריצות (rank)
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # יראה כמה מעט פרמטרים מתאמנים בפועל!

# טעינת דאטה-סט לדוגמה
dataset = load_dataset("json", data_files="training_data.jsonl")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
)

trainer.train()
model.save_pretrained("./fine-tuned-model")
```

## דוגמת קוד — Fine-Tuning דרך OpenAI API

```python
from openai import OpenAI

client = OpenAI()

# שלב 1: העלאת קובץ הדאטה (JSONL בפורמט chat)
file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# שלב 2: יצירת job לאימון
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini-2024-07-18"
)

print(f"Fine-tuning job status: {job.status}")
```

### פורמט קובץ אימון לדוגמה (JSONL)

```json
{"messages": [{"role": "system", "content": "אתה עוזר תמיכה טכני"}, {"role": "user", "content": "המחשב שלי לא נדלק"}, {"role": "assistant", "content": "בואו נבדוק: האם נורית ההפעלה דולקת?"}]}
{"messages": [{"role": "system", "content": "אתה עוזר תמיכה טכני"}, {"role": "user", "content": "האינטרנט לא עובד"}, {"role": "assistant", "content": "נסו לאתחל את הראוטר ולהמתין 30 שניות"}]}
```

## הכנת דאטה-סט איכותי — עקרונות

1. **גיוון** — כסו מגוון רחב של מקרים ותרחישים, לא רק "המקרה השכיח".
2. **עקביות** — פורמט אחיד לכל הדוגמאות.
3. **איכות על פני כמות** — 500 דוגמאות מעולות עדיפות על 5000 בינוניות.
4. **הפרדת Train/Validation/Test** — כדי למדוד אמיתות את הביצועים ולזהות Overfitting.
5. **ניקוי דאטה** — הסרת כפילויות, שגיאות, ותוכן לא רלוונטי.

## הערכת מודל מכוונן

| מדד | מה בודקים |
|---|---|
| Perplexity | עד כמה המודל "מופתע" מהטקסט — נמוך יותר = טוב יותר |
| Task-specific Accuracy | דיוק במשימה הספציפית (למשל סיווג, F1-score) |
| Human Evaluation | הערכה איכותית ע"י בני אדם |
| A/B Testing | השוואת המודל המכוונן מול הבייסליין בסביבת אמת |

## סרטוני יוטיוב מומלצים

- Andrej Karpathy — "State of GPT" (כולל הסבר על שלבי fine-tuning ו-RLHF): https://www.youtube.com/watch?v=bZQun8Y4L2A
- Hugging Face — סדרת מדריכי Fine-tuning עם PEFT/LoRA: https://www.youtube.com/@HuggingFace
- Trelis Research — מדריכים מעשיים מעמיקים על LoRA/QLoRA: https://www.youtube.com/@TrelisResearch

## תיעוד רשמי

- Hugging Face PEFT Docs: https://huggingface.co/docs/peft/index
- OpenAI Fine-tuning Guide: https://platform.openai.com/docs/guides/fine-tuning
- Anthropic — אפשרויות כיוונון והתאמה: https://docs.claude.com
- LoRA Paper המקורי: https://arxiv.org/abs/2106.09685

## שאלות ראיון עבודה נפוצות

1. **מה ההבדל בין Full Fine-tuning ל-LoRA?** תשובה: LoRA מקפיא את המשקלים המקוריים ומוסיף מטריצות קטנות ניתנות אימון, מה שחוסך זיכרון ומאפשר שמירת "adapters" קטנים במקום מודל שלם.
2. **מתי הייתם ממליצים על Fine-tuning לעומת RAG או Prompt Engineering?**
3. **מהו RLHF וכיצד הוא שונה מ-Supervised Fine-tuning?**
4. **כיצד מזהים Overfitting בתהליך fine-tuning ומה עושים בנדון?** תשובה: מעקב אחר loss על validation set; אם ה-training loss יורד אך validation loss עולה — סימן ל-overfitting. פתרונות: הפחתת epochs, הוספת דאטה, regularization.
5. **מה זה Catastrophic Forgetting?** תשובה: תופעה שבה המודל "שוכח" יכולות כלליות שהיו לו לפני ה-fine-tuning, כתוצאה מהתמקדות יתר בדאטה הצר של הכיוונון.

## טיפים וטריקים

- **התחילו תמיד מ-Prompt Engineering ו-RAG** לפני שקופצים ל-fine-tuning — זה זול ומהיר יותר.
- **בדקו את היחס עלות-תועלת** — fine-tuning דורש דאטה, זמן, וכוח חישוב.
- **שמרו checkpoint-ים** לאורך האימון כדי שתוכלו לחזור אחורה אם משהו משתבש.
- **השתמשו ב-QLoRA** אם יש לכם משאבי GPU מוגבלים — הוא מאפשר לכוונן מודלים גדולים גם על חומרה סבירה.
- **תמיד השוו** מודל מכוונן מול Baseline עם Prompt Engineering טוב — לעיתים ההשקעה לא משתלמת.

---
*המדריך הבא: מדריך 7 — AI Agents וסוכני בינה מלאכותית*
