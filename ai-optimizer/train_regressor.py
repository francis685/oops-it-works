import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib

# Example synthetic dataset
data = {
    "HoursWorked": [6, 9, 10, 8, 12, 5, 7, 11, 4, 13],
    "DaysSinceLastLeave": [2, 7, 8, 5, 10, 1, 3, 9, 0, 11],
    "PatientSeverityIndex": [4, 9, 7, 6, 8, 3, 5, 9, 2, 10],
    "EmotionalLoad": [3, 7, 8, 6, 9, 2, 5, 9, 1, 10],
    "SleepHours": [7, 5, 4, 6, 3, 8, 7, 4, 9, 3],
    "FatigueHoursLeft": [7.5, 4.2, 3.1, 5.8, 2.5, 8.3, 6.9, 3.7, 9.0, 2.0]
}

df = pd.DataFrame(data)
X = df.drop("FatigueHoursLeft", axis=1)
y = df["FatigueHoursLeft"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train regression model
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_scaled, y)

# Save model & scaler
joblib.dump(model, "fatigue_regressor.pkl")
joblib.dump(scaler, "fatigue_scaler.pkl")

print("✅ Regressor model trained and saved successfully!")
