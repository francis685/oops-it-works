# train_fatigue.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, r2_score
import joblib

# -------- 1) Example dataset (replace later with real data) --------
np.random.seed(42)
N = 1000
df = pd.DataFrame({
    "HoursWorked": np.clip(np.random.normal(8, 2, N), 0, 16),
    "DaysSinceLastLeave": np.random.randint(0, 15, N),
    "PatientSeverityIndex": np.random.randint(1, 10, N),
    "EmotionalLoad": np.random.randint(1, 10, N),
    "SleepHours": np.clip(np.random.normal(6.5, 1.5, N), 0, 10),
    "NightShifts": np.random.randint(0, 5, N),
    "ExperienceYears": np.random.randint(0, 20, N),
    "Age": np.random.randint(22, 60, N),
})

# Synthetic fatigue label (you can replace with your labels)
fatigue_score = (
    df["HoursWorked"]*0.25
  - df["SleepHours"]*0.2
  + df["PatientSeverityIndex"]*0.2
  + df["EmotionalLoad"]*0.2
  + df["NightShifts"]*0.1
  - df["ExperienceYears"]*0.05
)
labels = pd.cut(
    fatigue_score, bins=[-10, 3.8, 6.5, 8.5, 100],
    labels=["Fresh", "Moderate", "Tired", "Fatigued"]
)
df["FatigueLevel"] = labels

# Hours until burnout (regression target) — synthetic
df["HoursUntilFatigue"] = np.clip(10 - fatigue_score + np.random.normal(0, 0.8, N), 0, 12)

X = df.drop(columns=["FatigueLevel", "HoursUntilFatigue"])
y_cls = df["FatigueLevel"]
y_reg = df["HoursUntilFatigue"]

# -------- 2) Encode labels for classifier --------
le = LabelEncoder()
y_cls_enc = le.fit_transform(y_cls)

# -------- 3) Split --------
X_train, X_test, ytr_cls, yte_cls = train_test_split(X, y_cls_enc, test_size=0.2, random_state=42, stratify=y_cls_enc)
_,       _,     ytr_reg, yte_reg = train_test_split(X, y_reg,     test_size=0.2, random_state=42)

# -------- 4) Classifier pipeline + grid search --------
clf_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(random_state=42))
])
clf_grid = {
    "rf__n_estimators": [150, 250],
    "rf__max_depth": [None, 10, 20],
    "rf__min_samples_split": [2, 5],
    "rf__min_samples_leaf": [1, 2]
}
clf_cv = GridSearchCV(clf_pipe, clf_grid, cv=3, n_jobs=-1)
clf_cv.fit(X_train, ytr_cls)
acc = accuracy_score(yte_cls, clf_cv.predict(X_test))
print(f"✅ Classifier accuracy: {acc*100:.2f}%")

# -------- 5) Regressor pipeline --------
reg_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestRegressor(n_estimators=300, random_state=42))
])
reg_pipe.fit(X_train, ytr_reg)
r2 = r2_score(yte_reg, reg_pipe.predict(X_test))
print(f"📈 Regressor R²: {r2:.2f}")

# -------- 6) Save artifacts --------
joblib.dump(clf_cv.best_estimator_, "fatigue_rf_model.pkl")
joblib.dump(reg_pipe,             "fatigue_regressor.pkl")
# save a standalone scaler consistent with classifier (optional convenience)
scaler = clf_cv.best_estimator_.named_steps["scaler"]
joblib.dump(scaler,               "fatigue_scaler.pkl")
joblib.dump(le,                   "fatigue_label_encoder.pkl")
print("💾 Saved: fatigue_rf_model.pkl, fatigue_regressor.pkl, fatigue_scaler.pkl, fatigue_label_encoder.pkl")
