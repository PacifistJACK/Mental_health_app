from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

# --------------------------------------------------
# PATH SETUP (CRITICAL FOR RENDER / LINUX)
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "mental_health_model.joblib"

# --------------------------------------------------
# LOAD ML MODEL
# --------------------------------------------------

model_data = joblib.load(MODEL_PATH)
model = model_data["model"]
scaler = model_data["scaler"]
label_encoder = model_data["label_encoder"]

# --------------------------------------------------
# FEATURE ENGINEERING
# --------------------------------------------------

def create_enhanced_features(X: pd.DataFrame) -> pd.DataFrame:
    X_enhanced = X.copy()

    X_enhanced["total_score"] = X.sum(axis=1)
    X_enhanced["mean_score"] = X.mean(axis=1)

    anxiety_questions = [1, 2, 3, 6, 7]
    depression_questions = [0, 4, 5, 8, 9]

    X_enhanced["anxiety_score"] = X.iloc[:, anxiety_questions].sum(axis=1)
    X_enhanced["depression_score"] = X.iloc[:, depression_questions].sum(axis=1)

    X_enhanced["high_anxiety"] = (X_enhanced["anxiety_score"] > 12).astype(int)
    X_enhanced["high_depression"] = (X_enhanced["depression_score"] > 12).astype(int)

    return X_enhanced

# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class Answers(BaseModel):
    answers: list[int]

# --------------------------------------------------
# ROUTER
# --------------------------------------------------

router = APIRouter()

@router.post("/predict")
def predict(data: Answers):

    df = pd.DataFrame(
        [data.answers],
        columns=[f"Q{i+1}" for i in range(10)]
    )

    X = create_enhanced_features(df)
    X_scaled = scaler.transform(X)

    pred_encoded = model.predict(X_scaled)[0]
    pred_proba = model.predict_proba(X_scaled)[0]

    condition = label_encoder.inverse_transform([pred_encoded])[0]

    confidence_scores = {
        label: float(pred_proba[i])
        for i, label in enumerate(label_encoder.classes_)
    }

    anxiety_score = sum(data.answers[i] for i in [1, 2, 3, 6, 7]) * 4
    depression_score = sum(data.answers[i] for i in [0, 4, 5, 8, 9]) * 4

    risk_levels = {
        "No Issue": "Low",
        "Mild Anxiety": "Mild",
        "Mild Depression": "Mild",
        "Moderate Anxiety": "Moderate",
        "Moderate Depression": "Moderate",
        "Anxiety + Depression": "High",
    }

    return {
        "condition": condition,
        "confidence": float(max(pred_proba)),
        "all_confidence_scores": confidence_scores,
        "anxiety_score": anxiety_score,
        "depression_score": depression_score,
        "risk_level": risk_levels.get(condition, "Unknown"),
    }
