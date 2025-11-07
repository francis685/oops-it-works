# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load models at startup
try:
    clf = joblib.load("fatigue_rf_model.pkl")
    reg = joblib.load("fatigue_regressor.pkl")
    scaler = joblib.load("fatigue_scaler.pkl")
    encoder = joblib.load("fatigue_label_encoder.pkl")
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

def get_recommendation(fatigue_level, burnout_hours):
    """Generate contextual recommendations"""
    if fatigue_level == "Fresh":
        return "Ready for high-acuity patients (A1-A2). Maintain current workload."
    elif fatigue_level == "Moderate":
        return "Can handle moderate workload (A2-A3). Monitor for signs of stress."
    elif fatigue_level == "Tired":
        return "Assign lighter patients (A4-A5). Consider break or reduced hours."
    else:  # Fatigued
        if burnout_hours < 2:
            return "⚠️ CRITICAL: Immediate rest required. Risk of medical errors high."
        return "🚨 High burnout risk. Assign A5 only or send home for rest."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract features in correct order
        features = np.array([[
            data['HoursWorked'],
            data['DaysSinceLastLeave'],
            data['PatientSeverityIndex'],
            data['EmotionalLoad'],
            data['SleepHours'],
            data['NightShifts'],
            data['ExperienceYears'],
            data['Age']
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Get predictions
        fatigue_encoded = clf.predict(features_scaled)[0]
        fatigue_label = encoder.inverse_transform([fatigue_encoded])[0]
        fatigue_proba = clf.predict_proba(features_scaled)[0]
        burnout_time = max(0.5, reg.predict(features_scaled)[0])  # Minimum 0.5 hours
        
        # Get recommendation
        recommendation = get_recommendation(fatigue_label, burnout_time)
        
        # Calculate risk level
        confidence = float(max(fatigue_proba)) * 100
        risk_level = "Low" if fatigue_label == "Fresh" else \
                     "Medium" if fatigue_label == "Moderate" else \
                     "High" if fatigue_label == "Tired" else "Critical"
        
        return jsonify({
            'fatigueLevel': fatigue_label,
            'fatigueProbabilities': {
                label: float(prob) 
                for label, prob in zip(encoder.classes_, fatigue_proba)
            },
            'burnoutTimeHours': round(float(burnout_time), 2),
            'confidence': round(confidence, 1),
            'recommendation': recommendation,
            'riskLevel': risk_level,
            'inputSummary': {
                'hoursWorked': data['HoursWorked'],
                'patientLoad': round(data['PatientSeverityIndex'], 1),
                'sleepHours': data['SleepHours']
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'AI Fatigue Prediction API is running'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)