"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
Dataset Generator - Creates a synthetic dataset for training the ML model
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 800

def generate_dataset():
    data = {
        "team_size": np.random.randint(3, 25, N),
        "project_budget": np.random.randint(50000, 2000000, N),
        "project_duration": np.random.randint(1, 24, N),  # months
        "requirement_change_count": np.random.randint(0, 30, N),
        "average_sprint_delay": np.round(np.random.uniform(0, 10, N), 2),  # days
        "bug_count": np.random.randint(0, 150, N),
        "testing_coverage": np.round(np.random.uniform(10, 100, N), 2),  # %
        "code_complexity": np.random.randint(1, 10, N),
        "developer_experience": np.round(np.random.uniform(0.5, 15, N), 1),  # years
        "communication_frequency": np.random.randint(1, 10, N),  # meetings/week
        "task_completion_rate": np.round(np.random.uniform(30, 100, N), 2),  # %
        "client_change_requests": np.random.randint(0, 20, N),
        "previous_project_success_rate": np.round(np.random.uniform(20, 100, N), 2),  # %
    }

    df = pd.DataFrame(data)

    # Risk score calculation (deterministic based on features)
    risk_score = (
        (df["requirement_change_count"] / 30) * 20 +
        (df["average_sprint_delay"] / 10) * 20 +
        (df["bug_count"] / 150) * 15 +
        ((100 - df["testing_coverage"]) / 100) * 15 +
        (df["code_complexity"] / 10) * 10 +
        ((15 - df["developer_experience"]) / 15) * 10 +
        (df["client_change_requests"] / 20) * 10 +
        ((100 - df["task_completion_rate"]) / 100) * 10 +
        ((100 - df["previous_project_success_rate"]) / 100) * 5 +
        ((10 - df["communication_frequency"]) / 10) * 5 +
        np.random.uniform(-5, 5, N)  # noise
    )

    risk_score = risk_score.clip(0, 100)
    df["risk_score"] = np.round(risk_score, 2)

    def classify_risk(score):
        if score < 35:
            return "Low"
        elif score < 65:
            return "Medium"
        else:
            return "High"

    df["risk_level"] = df["risk_score"].apply(classify_risk)

    os.makedirs("dataset", exist_ok=True)
    df.to_csv("dataset/software_project_risk_data.csv", index=False)
    print(f"Dataset generated: {N} rows")
    print(df["risk_level"].value_counts())
    return df

if __name__ == "__main__":
    generate_dataset()
