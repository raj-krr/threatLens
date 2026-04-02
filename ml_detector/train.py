import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os

def generate_normal_traffic(samples=2000):
    np.random.seed(42)
    return pd.DataFrame({
        'requests_per_min':           np.random.randint(1, 15, samples),
        'unique_endpoints':           np.random.randint(2, 10, samples),
        'avg_time_between_requests':  np.random.uniform(500, 8000, samples),
        'login_attempts':             np.random.randint(0, 3, samples),
        'error_rate':                 np.random.uniform(0, 0.15, samples),
    })

def generate_attack_traffic(samples=200):
    np.random.seed(0)
    return pd.DataFrame({
        'requests_per_min':           np.random.randint(100, 500, samples),
        'unique_endpoints':           np.random.randint(1, 3, samples),
        'avg_time_between_requests':  np.random.uniform(10, 100, samples),
        'login_attempts':             np.random.randint(20, 100, samples),
        'error_rate':                 np.random.uniform(0.6, 1.0, samples),
    })

# Combine normal + attack data
normal = generate_normal_traffic(2000)
attack = generate_attack_traffic(200)

df = pd.concat([normal, attack], ignore_index=True)

scaler = StandardScaler()
X = scaler.fit_transform(df)

# contamination = attack samples / total samples = 200/2200 ≈ 0.09
model = IsolationForest(contamination=0.09, random_state=42)
model.fit(X)

os.makedirs('ml_detector', exist_ok=True)
pickle.dump(model,  open('ml_detector/model.pkl', 'wb'))
pickle.dump(scaler, open('ml_detector/scaler.pkl', 'wb'))

print("Model trained on normal + attack traffic ✅")
print(f"Normal samples: 2000 | Attack samples: 200 | Total: 2200")