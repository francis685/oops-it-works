# save this as train_fatigue_model.py in D:\oops-it-works\ai-optimizer
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
import joblib
import numpy as np

# ✅ Generate synthetic realistic dataset
np.random.seed(42)
n_samples = 1000  # More samples for better training
df = pd.DataFrame({
    "HoursWorked": np.random.randint(6, 14, n_samples),
    "DaysSinceLastLeave": np.random.randint(0, 20, n_samples),
    "PatientSeverityIndex": np.random.uniform(1, 10, n_samples),  # Now accepts decimals
    "EmotionalLoad": np.random.randint(1, 10, n_samples),
    "SleepHours": np.random.randint(4, 9, n_samples),
    "NightShifts": np.random.randint(0, 6, n_samples),
    "ExperienceYears": np.random.randint(1, 20, n_samples),
    "Age": np.random.randint(22, 60, n_samples),
})

# ✅ REALISTIC Fatigue Score Calculation
# Higher patient severity = MORE fatigue (A1 = worst, A5 = easiest)
# More hours worked = MORE fatigue
# Less sleep = MORE fatigue
# More night shifts = MORE fatigue
# More days since leave = MORE fatigue

fatigue_score = (
    df["HoursWorked"] * 3.5 +                    # Long hours increase fatigue heavily
    df["PatientSeverityIndex"] * 4.0 +           # A1 patients (high severity) = high fatigue
    (10 - df["SleepHours"]) * 3.0 +              # Less sleep = more fatigue
    df["NightShifts"] * 2.5 +                    # Night shifts drain energy
    df["DaysSinceLastLeave"] * 0.8 +             # No breaks = burnout
    (50 - df["Age"]) * 0.3 +                     # Younger nurses have slightly more energy
    (20 - df["ExperienceYears"]) * 0.5 -         # Less experience = more stress
    df["EmotionalLoad"] * 2.0                    # High emotional load = fatigue
)

# Normalize score to 0-100 range
fatigue_score = (fatigue_score - fatigue_score.min()) / (fatigue_score.max() - fatigue_score.min()) * 100

# ✅ Realistic Fatigue Level Labels
df["FatigueLevel"] = pd.cut(
    fatigue_score,
    bins=[0, 25, 50, 75, 100],
    labels=["Fresh", "Moderate", "Tired", "Fatigued"]
)

# Label encode
encoder = LabelEncoder()
df["FatigueLevelEncoded"] = encoder.fit_transform(df["FatigueLevel"])

X = df.drop(["FatigueLevel", "FatigueLevelEncoded"], axis=1)
y = df["FatigueLevelEncoded"]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train classifier with better parameters
clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=5,
    random_state=42
)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred) * 100
print(f"✅ Classifier Accuracy: {accuracy:.2f}%")

# ✅ Realistic Burnout Time Calculation
# Higher fatigue = less time until burnout
# Formula: More work intensity = faster burnout
burnout_hours = 12 - (
    df["HoursWorked"] * 0.5 +
    df["PatientSeverityIndex"] * 0.4 +
    df["NightShifts"] * 0.3 +
    (10 - df["SleepHours"]) * 0.2
)
burnout_hours = burnout_hours.clip(lower=0.5, upper=12)  # Between 0.5 and 12 hours

# Train regressor
reg = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    random_state=42
)
reg.fit(X_scaled, burnout_hours)

# Save models
joblib.dump(clf, "fatigue_rf_model.pkl")
joblib.dump(reg, "fatigue_regressor.pkl")
joblib.dump(scaler, "fatigue_scaler.pkl")
joblib.dump(encoder, "fatigue_label_encoder.pkl")

print("💾 Models saved successfully!")
print(f"📊 Fatigue distribution:")
print(df["FatigueLevel"].value_counts())