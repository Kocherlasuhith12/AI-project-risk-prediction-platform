"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
Model Training Script - Trains Random Forest classifier and saves model
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
import joblib
import json
import os

FEATURES = [
    "team_size", "project_budget", "project_duration",
    "requirement_change_count", "average_sprint_delay",
    "bug_count", "testing_coverage", "code_complexity",
    "developer_experience", "communication_frequency",
    "task_completion_rate", "client_change_requests",
    "previous_project_success_rate"
]
TARGET = "risk_level"


def train():
    # Load dataset
    df = pd.read_csv("dataset/software_project_risk_data.csv")
    print(f"Dataset loaded: {len(df)} rows")

    X = df[FEATURES]
    y = df[TARGET]

    # Encode labels
    le = LabelEncoder()
    le.fit(["Low", "Medium", "High"])
    y_encoded = le.transform(y)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Feature importances
    importances = dict(zip(FEATURES, model.feature_importances_.tolist()))
    importances = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))

    # Save
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/risk_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")
    joblib.dump(le, "models/label_encoder.pkl")

    metadata = {
        "features": FEATURES,
        "classes": le.classes_.tolist(),
        "accuracy": round(acc, 4),
        "feature_importances": importances
    }
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("\nModel saved to models/")
    print("Feature Importances:")
    for feat, imp in list(importances.items())[:5]:
        print(f"  {feat}: {imp:.4f}")

    return model, scaler, le


if __name__ == "__main__":
    train()
