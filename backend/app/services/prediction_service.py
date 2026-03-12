"""
ML Prediction Service
Loads trained model and makes risk predictions with explanations
"""

import joblib
import numpy as np
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
ML_DIR = BASE_DIR / "ml" / "models"

# Lazy-load model artifacts
_model = None
_scaler = None
_le = None
_metadata = None

FEATURES = [
    "team_size", "project_budget", "project_duration",
    "requirement_change_count", "average_sprint_delay",
    "bug_count", "testing_coverage", "code_complexity",
    "developer_experience", "communication_frequency",
    "task_completion_rate", "client_change_requests",
    "previous_project_success_rate"
]

FEATURE_LABELS = {
    "requirement_change_count": "Frequent Requirement Changes",
    "average_sprint_delay": "High Sprint Delays",
    "testing_coverage": "Low Testing Coverage",
    "bug_count": "High Bug Count",
    "task_completion_rate": "Low Task Completion Rate",
    "code_complexity": "High Code Complexity",
    "developer_experience": "Low Developer Experience",
    "client_change_requests": "Many Client Change Requests",
    "previous_project_success_rate": "Low Past Success Rate",
    "communication_frequency": "Poor Communication Frequency",
    "team_size": "Team Size",
    "project_budget": "Project Budget",
    "project_duration": "Project Duration"
}


def _load():
    global _model, _scaler, _le, _metadata
    if _model is None:
        _model = joblib.load(ML_DIR / "risk_model.pkl")
        _scaler = joblib.load(ML_DIR / "scaler.pkl")
        _le = joblib.load(ML_DIR / "label_encoder.pkl")
        with open(ML_DIR / "model_metadata.json") as f:
            _metadata = json.load(f)


def predict_risk(features: dict) -> dict:
    _load()

    # Build feature vector
    X = np.array([[features[f] for f in FEATURES]])
    X_scaled = _scaler.transform(X)

    proba = _model.predict_proba(X_scaled)[0]
    pred_idx = np.argmax(proba)
    risk_level = _le.inverse_transform([pred_idx])[0]

    # Risk score (0-10 scale)
    class_order = _le.classes_.tolist()  # ['High', 'Low', 'Medium']
    high_idx = class_order.index("High")
    med_idx = class_order.index("Medium")
    low_idx = class_order.index("Low")

    risk_score = round(
        proba[high_idx] * 10 + proba[med_idx] * 5 + proba[low_idx] * 1,
        2
    )

    # Feature importances from model
    importances = _metadata["feature_importances"]
    sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)

    # Identify top contributing factors based on feature value + importance
    top_factors = []
    for feat, imp in sorted_feats[:6]:
        val = features.get(feat, 0)
        label = FEATURE_LABELS.get(feat, feat)
        top_factors.append({"feature": feat, "label": label, "importance": round(imp, 4), "value": val})

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "probabilities": {
            "High": round(float(proba[high_idx]), 4),
            "Medium": round(float(proba[med_idx]), 4),
            "Low": round(float(proba[low_idx]), 4),
        },
        "top_factors": top_factors,
    }
