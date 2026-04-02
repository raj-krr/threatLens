import sys, json, pickle
import numpy as np

model  = pickle.load(open('ml_detector/model.pkl', 'rb'))
scaler = pickle.load(open('ml_detector/scaler.pkl', 'rb'))

data = json.loads(sys.argv[1])

X = np.array([[
    data['requests_per_min'],
    data['unique_endpoints'],
    data['avg_time_between_requests'],
    data['login_attempts'],
    data['error_rate']
]])

X_scaled = scaler.transform(X)
result = model.predict(X_scaled)[0]
score  = model.score_samples(X_scaled)[0]

print(json.dumps({
    'is_anomaly': bool(result == -1),
    'confidence': float(abs(score)),
    'label': 'ANOMALY' if result == -1 else 'NORMAL'
}))