import sys, json, pickle
import numpy as np

model = pickle.load(open('ml_detector/model.pkl', 'rb'))
scaler = pickle.load(open('ml_detector/scaler.pkl', 'rb'))

# Load attack classifier if it exists (optional, from Day 2)
try:
    clf = pickle.load(open('ml_detector/classifier.pkl', 'rb'))
    has_classifier = True
except:
    has_classifier = False

data = json.loads(sys.argv[1])

# Wrap in DataFrame so feature names match:
import pandas as pd
X = pd.DataFrame([[
    data['requests_per_min'],
    data['unique_endpoints'],
    data['avg_time_between_requests'],
    data['login_attempts'],
    data['error_rate']
]], columns=['requests_per_min', 'unique_endpoints', 
             'avg_time_between_requests', 'login_attempts', 'error_rate'])

X_scaled = scaler.transform(X)
result = model.predict(X_scaled)[0]
raw_score = model.score_samples(X_scaled)[0]

# Convert raw float to 0-100 confidence
# score_samples returns negative values; more negative = more anomalous
confidence = min(100, max(0, int(abs(raw_score) * 100)))

# Determine attack_type
if has_classifier:
    attack_pred = clf.predict(X_scaled)[0]
    attack_type = attack_pred
else:
    # Heuristic fallback when no classifier is trained yet
    if data['login_attempts'] > 10:
        attack_type = 'BRUTE_FORCE'
    elif data['requests_per_min'] > 60:
        attack_type = 'DDOS'
    elif data['error_rate'] > 0.7:
        attack_type = 'SCAN'
    else:
        attack_type = 'normal'

is_anomaly = result == -1

print(json.dumps({
    'is_anomaly': bool(is_anomaly),
    'confidence': confidence,
    'attack_type': attack_type if is_anomaly else 'normal',
    'label': 'ANOMALY' if is_anomaly else 'NORMAL'
}))